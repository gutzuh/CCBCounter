-- Reset do esquema do Supabase para uma versão simples
-- IMPORTANTE: isso apaga dados. Faça backup antes de executar.

-- Opção recomendada: use o 'SQL Editor' do Supabase e faça um backup/export antes
-- (em Settings / Database / Backups -> Export).

-- 1) (Opcional) criar tabelas de backup local no banco antes do DROP
-- se preferir manter uma cópia, descomente as linhas abaixo e rode
-- CREATE TABLE backup_contabilizacao AS TABLE contabilizacao;
-- CREATE TABLE backup_instrumentos AS TABLE instrumentos;
-- CREATE TABLE backup_contabilizacao_instrumentos AS TABLE contabilizacao_instrumentos;
-- CREATE TABLE backup_contabilizacao_changes AS TABLE contabilizacao_changes;

BEGIN;

-- Remover tabelas antigas (se existirem)
DROP TABLE IF EXISTS contabilizacao_instrumentos CASCADE;
DROP TABLE IF EXISTS instrumentos CASCADE;
DROP TABLE IF EXISTS contabilizacao_changes CASCADE;
DROP TABLE IF EXISTS contabilizacao CASCADE;

-- Criar esquema simples e mínimo
CREATE TABLE contabilizacao (
  id serial PRIMARY KEY,
  data timestamptz DEFAULT now(),
  musicians integer DEFAULT 0,
  organists integer DEFAULT 0,
  printed boolean DEFAULT false,
  admin boolean DEFAULT false
);

CREATE TABLE instrumentos (
  id serial PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

CREATE TABLE contabilizacao_instrumentos (
  id serial PRIMARY KEY,
  contabilizacao_id integer NOT NULL REFERENCES contabilizacao(id) ON DELETE CASCADE,
  instrumento_id integer NOT NULL REFERENCES instrumentos(id) ON DELETE RESTRICT,
  quantidade integer DEFAULT 0,
  CONSTRAINT ux_contabilizacao_instrumento UNIQUE (contabilizacao_id, instrumento_id)
);

CREATE TABLE contabilizacao_changes (
  id serial PRIMARY KEY,
  contabilizacao_id integer REFERENCES contabilizacao(id) ON DELETE SET NULL,
  data timestamptz DEFAULT now(),
  field text NOT NULL,
  old_value text,
  new_value text,
  changed_by text
);

COMMIT;

-- Observações:
-- - Rode esse arquivo no SQL Editor do seu projeto Supabase.
-- - Se quiser permitir que o cliente chame a RPC, crie as funções e permissões necessárias após esse reset.
-- - Em produção, prefira usar um backend para chamadas com a service_role.
