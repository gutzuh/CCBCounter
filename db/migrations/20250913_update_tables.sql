-- Migration: Normalizar instruments, ajustar printed e melhorar change log
-- Fecha: 2025-09-13

BEGIN;

-- 1) Criar tabela principal (idempotente)
CREATE TABLE IF NOT EXISTS contabilizacao (
  id serial PRIMARY KEY,
  data timestamptz DEFAULT now(),
  musicians integer DEFAULT 0,
  organists integer DEFAULT 0,
  -- printed passa a ser boolean para indicar se foi impresso
  printed boolean DEFAULT false,
  -- printed_at registra quando foi impresso (nullable)
  printed_at timestamptz,
  admin boolean DEFAULT false
);

-- 2) Tabela de instrumentos normalizada
CREATE TABLE IF NOT EXISTS instrumentos (
  id serial PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

-- 3) Tabela de relacionamento entre contabilizacao e instrumentos
CREATE TABLE IF NOT EXISTS contabilizacao_instrumentos (
  id serial PRIMARY KEY,
  contabilizacao_id integer NOT NULL REFERENCES contabilizacao(id) ON DELETE CASCADE,
  instrumento_id integer NOT NULL REFERENCES instrumentos(id) ON DELETE RESTRICT,
  quantidade integer DEFAULT 0,
  CONSTRAINT ux_contabilizacao_instrumento UNIQUE (contabilizacao_id, instrumento_id)
);

-- 4) Tabela de log de mudanças (mais contexto)
CREATE TABLE IF NOT EXISTS contabilizacao_changes (
  id serial PRIMARY KEY,
  contabilizacao_id integer REFERENCES contabilizacao(id) ON DELETE SET NULL,
  data timestamptz DEFAULT now(),
  field text NOT NULL,
  old_value text,
  new_value text,
  changed_by text -- opcional: armazenar usuário que fez a alteração
);

-- 5) Se existir a tabela antiga com campo instruments jsonb, migrar os dados
-- Detecção segura: checa se a coluna existe antes de tentar migrar
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='contabilizacao' AND column_name='instruments'
  ) THEN
    -- Para cada linha com instruments jsonb, inserir instrumentos na nova estrutura
    WITH rows AS (
      SELECT id, instruments FROM contabilizacao
      WHERE instruments IS NOT NULL
    ),
    expanded AS (
      SELECT r.id as contabilizacao_id, kv.key as instrumento_nome, kv.value as quantidade_text
      FROM rows r
      -- Se instruments já for json/jsonb, usamos diretamente; se for text, tentamos um cast seguro
      CROSS JOIN LATERAL (
        SELECT key, value FROM jsonb_each_text(
          CASE
            WHEN pg_typeof(r.instruments) IN ('jsonb'::regtype, 'json'::regtype) THEN r.instruments::jsonb
            -- heurística: se parece um objeto JSON (começa com { e termina com }), tenta castar
            WHEN r.instruments::text ~ '^\s*\{.*\}\s*$' THEN r.instruments::text::jsonb
            ELSE '{}'::jsonb -- fallback vazio para evitar erro de função inexistente
          END
        ) AS kv(key, value)
      ) kv
    ),
    converted AS (
      SELECT contabilizacao_id, instrumento_nome, COALESCE(NULLIF(quantidade_text, ''), '0')::integer as quantidade
      FROM expanded
    ),
    -- Inserção de instrumentos únicos (CTE de modificação de dados)
    inserted_instruments AS (
      INSERT INTO instrumentos (nome)
      SELECT DISTINCT instrumento_nome FROM converted
      ON CONFLICT (nome) DO NOTHING
      RETURNING id, nome
    )
    INSERT INTO contabilizacao_instrumentos (contabilizacao_id, instrumento_id, quantidade)
    SELECT c.contabilizacao_id, i.id, c.quantidade
    FROM converted c
    JOIN instrumentos i ON i.nome = c.instrumento_nome
    ON CONFLICT (contabilizacao_id, instrumento_id) DO UPDATE
    SET quantidade = EXCLUDED.quantidade;

    -- Opcional: remover a coluna antiga (comente se não quiser remover)
    -- ALTER TABLE contabilizacao DROP COLUMN instruments;
  END IF;
END
$$ LANGUAGE plpgsql;

COMMIT;

-- Observações:
-- - Essa migration converte um JSONB do formato {"Violão": "3", "Teclado": "1"}
--   para linhas na tabela `instrumentos` e relacionamentos em `contabilizacao_instrumentos`.
-- - `printed` foi alterado para boolean e `printed_at` adicionado. Se você preferir manter
--   `printed integer` substitua a definição acima ou remova `printed_at`.
-- - A coluna antiga `instruments` não é removida automaticamente; se quiser removê-la,
--   descomente a linha `ALTER TABLE contabilizacao DROP COLUMN instruments;` após revisar os dados.
