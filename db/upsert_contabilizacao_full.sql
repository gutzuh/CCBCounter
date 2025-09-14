-- RPC: upsert_contabilizacao_full
-- Faz upsert atômico em contabilizacao, instrumentos e contabilizacao_instrumentos
-- Recebe p_cont (jsonb) e p_instruments (jsonb: {"Violinos": "2", ...})

create or replace function public.upsert_contabilizacao_full(
  p_cont jsonb,
  p_instruments jsonb
 ) returns integer language plpgsql as $$
declare
  v_id integer;
  k text;
  quantidade_text text;
  v_instr_id integer;
  v_printed integer;
begin
  -- Procurar por um registro existente pela coluna `data` (se houver)
  select id into v_id from contabilizacao where data = (p_cont->> 'data')::timestamptz limit 1;

  -- Normalizar valor de `printed` para inteiro (compatível com DB que usa integer)
  v_printed := null;
  if p_cont ? 'printed' then
    if (p_cont->> 'printed') ~ '^\d+$' then
      v_printed := (p_cont->> 'printed')::int;
    elsif lower(p_cont->> 'printed') in ('true','t','yes') then
      v_printed := 1;
    else
      v_printed := 0;
    end if;
  end if;

  if v_id is not null then
    -- Atualizar campos existentes (usar apenas colunas que existem na migration)
    update contabilizacao set
      musicians = COALESCE((p_cont->> 'musicians')::int, musicians),
      organists = COALESCE((p_cont->> 'organists')::int, organists),
      printed = COALESCE(v_printed, printed),
      admin = COALESCE((p_cont->> 'admin')::boolean, admin)
    where id = v_id;
  else
    -- Inserir novo registro com as colunas existentes
    insert into contabilizacao(data, musicians, organists, printed, admin)
    values (
      (p_cont->> 'data')::timestamptz,
      COALESCE((p_cont->> 'musicians')::int, 0),
      COALESCE((p_cont->> 'organists')::int, 0),
      COALESCE(v_printed, 0),
      COALESCE((p_cont->> 'admin')::boolean, false)
    ) returning id into v_id;
  end if;

  -- Iterar instrumentos do JSON e sincronizar
  if p_instruments is not null then
    for k, quantidade_text in select key, value from jsonb_each_text(p_instruments) loop
      -- garantir instrumento
      insert into instrumentos (nome) values (k) on conflict (nome) do nothing;
      select id into v_instr_id from instrumentos where nome = k limit 1;

      if v_instr_id is not null then
        if (coalesce(quantidade_text, '0')::int) > 0 then
          insert into contabilizacao_instrumentos (contabilizacao_id, instrumento_id, quantidade)
            values (v_id, v_instr_id, (quantidade_text)::int)
            on conflict (contabilizacao_id, instrumento_id) do update set quantidade = excluded.quantidade;
        else
          delete from contabilizacao_instrumentos where contabilizacao_id = v_id and instrumento_id = v_instr_id;
        end if;
      end if;
    end loop;
  end if;

  return v_id;
end;
$$;

-- Nota: após criar essa função no Supabase SQL editor, conceda execução conforme suas políticas.
