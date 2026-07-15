-- Código de invitación por entrenador (no ligado a un cliente concreto, a diferencia
-- de claim_client_invite() que empareja por email de una fila pre-creada). Cualquiera
-- que se registre con este código en /client/signup queda vinculado a este entrenador,
-- creando su fila de `clientes` en el momento, sin que el entrenador tenga que
-- introducir antes su nombre/email.

alter table public.profiles
  add column if not exists codigo_invitacion text unique;

-- Vincula al usuario recién confirmado (auth.uid()) como cliente del entrenador dueño
-- de p_code. Usa el nombre de user_metadata (guardado en el signUp) si existe.
create or replace function public.claim_client_invite_by_code(p_code text)
returns public.clientes
language plpgsql
security definer
set search_path = public
as $$
declare
  target_entrenador_id uuid;
  current_email text;
  current_name text;
  result public.clientes;
begin
  current_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if current_email = '' then
    raise exception 'No se pudo determinar el email de la sesión actual';
  end if;

  select id into target_entrenador_id
  from public.profiles
  where codigo_invitacion = p_code;

  if target_entrenador_id is null then
    raise exception 'Código de invitación no válido';
  end if;

  current_name := coalesce(
    auth.jwt() -> 'user_metadata' ->> 'full_name',
    split_part(current_email, '@', 1)
  );

  insert into public.clientes (entrenador_id, user_id, nombre, email, estado)
  values (target_entrenador_id, auth.uid(), current_name, current_email, 'Activo')
  returning * into result;

  return result;
end;
$$;

grant execute on function public.claim_client_invite_by_code(text) to authenticated;
