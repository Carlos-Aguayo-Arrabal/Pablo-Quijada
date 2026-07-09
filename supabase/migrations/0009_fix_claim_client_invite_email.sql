-- claim_client_invite() leía el email vía `select email from auth.users where id = auth.uid()`,
-- pero el rol que ejecuta la función (dueño de la función, no el rol `authenticated` que la
-- invoca) no tiene por qué poder leer auth.users directamente, y ese SELECT devolvía NULL en
-- silencio (RLS de auth.users lo filtra en vez de dar error) — por eso nunca encontraba la
-- invitación pendiente aunque existiera. auth.jwt() ->> 'email' lee el email directamente de
-- los claims de la sesión actual, sin tocar auth.users, así que siempre funciona.

create or replace function public.claim_client_invite()
returns public.clientes
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
  result public.clientes;
  current_email text;
begin
  current_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if current_email = '' then
    raise exception 'No se pudo determinar el email de la sesión actual';
  end if;

  select id into target_id
  from public.clientes
  where user_id is null
    and lower(email) = current_email
  order by creado_en asc
  limit 1;

  if target_id is null then
    raise exception 'No hay invitación pendiente para este email';
  end if;

  update public.clientes
  set user_id = auth.uid(), estado = 'Activo'
  where id = target_id
  returning * into result;

  return result;
end;
$$;
