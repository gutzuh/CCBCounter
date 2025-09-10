# CCBCounter
Aplicativo web para contar musicos, feito especialmente para ensaios regionais

## Observações sobre persistência

O aplicativo agora consulta o banco de dados sempre que inicia para recuperar o último estado salvo (última `contabilizacao`). Isso garante que clientes que entrarem depois do início vejam a contagem corrente.

Adicionalmente, mantemos um log de mudanças por campo para facilitar conferência e auditoria. Crie a tabela abaixo no Supabase (SQL):

```sql
-- snapshot table (já existente)
create table if not exists contabilizacao (
	id serial primary key,
	data timestamptz default now(),
	musicians integer default 0,
	organists integer default 0,
	instruments jsonb,
	printed integer default 0,
	admin boolean default false
);

-- change log table (campo-por-campo)
create table if not exists contabilizacao_changes (
	id serial primary key,
	contabilizacao_id integer references contabilizacao(id) on delete set null,
	data timestamptz default now(),
	field text not null,
	old_value text,
	new_value text
);
```
