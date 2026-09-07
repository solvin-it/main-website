create table solvin.rate_limits (
  bucket_key text primary key,
  request_count integer not null,
  window_started_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table solvin.rate_limits enable row level security;
grant all privileges on table solvin.rate_limits to service_role;

create or replace function solvin.consume_rate_limit(
  p_bucket_key text,
  p_request_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = solvin, pg_temp
as $$
declare
  current_count integer;
begin
  if p_request_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into solvin.rate_limits as limits (bucket_key, request_count, window_started_at, updated_at)
  values (p_bucket_key, 1, now(), now())
  on conflict (bucket_key) do update
  set request_count = case
        when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
        else limits.request_count + 1
      end,
      window_started_at = case
        when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
        else limits.window_started_at
      end,
      updated_at = now()
  returning request_count into current_count;

  return current_count <= p_request_limit;
end;
$$;

revoke all on function solvin.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function solvin.consume_rate_limit(text, integer, integer) to service_role;

create index rate_limits_updated_idx on solvin.rate_limits(updated_at);
