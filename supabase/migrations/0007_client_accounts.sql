-- Vincula filas de `clientes` (CRM del entrenador) a cuentas reales de Supabase Auth,
-- y añade el acceso de solo-lectura/escritura acotada que necesita el cliente
-- autenticado para ver y operar sobre sus propios datos desde /client.

alter table public.clientes
  add column user_id uuid references auth.users(id) on delete set null;

create unique index clientes_user_id_key on public.clientes (user_id) where user_id is not null;

-- CLIENTES: el cliente ve su propia ficha
create policy "Cliente ve su propia ficha"
  on public.clientes for select using (auth.uid() = user_id);

-- CHECKINS: lectura y creación por el propio cliente. Se exige que entrenador_id
-- coincida con el entrenador real del cliente (RLS no confía en lo que envíe el
-- cliente, lo verifica contra la fila de `clientes`), igual que el patrón ya usado
-- en 0006 para el lado entrenador.
create policy "Cliente ve sus propios checkins"
  on public.checkins for select using (
    exists (
      select 1 from public.clientes
      where clientes.id = checkins.cliente_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente crea sus propios checkins"
  on public.checkins for insert with check (
    exists (
      select 1 from public.clientes
      where clientes.id = checkins.cliente_id
      and clientes.user_id = auth.uid()
      and clientes.entrenador_id = checkins.entrenador_id
    )
  );

-- MENSAJES: lectura y envío por el propio cliente (solo remitente = 'cliente')
create policy "Cliente ve sus propios mensajes"
  on public.mensajes for select using (
    exists (
      select 1 from public.clientes
      where clientes.id = mensajes.cliente_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente envia mensajes propios"
  on public.mensajes for insert with check (
    remitente = 'cliente'
    and exists (
      select 1 from public.clientes
      where clientes.id = mensajes.cliente_id
      and clientes.user_id = auth.uid()
      and clientes.entrenador_id = mensajes.entrenador_id
    )
  );

-- PAGOS: solo lectura para el cliente (los pagos los gestiona el entrenador)
create policy "Cliente ve sus propios pagos"
  on public.pagos for select using (
    exists (
      select 1 from public.clientes
      where clientes.id = pagos.cliente_id
      and clientes.user_id = auth.uid()
    )
  );

-- Vinculación segura email -> user_id. NO se hace vía política RLS de UPDATE directa
-- sobre `clientes` (permitiría a cualquier usuario autenticado apropiarse de una fila
-- de cliente ajena cambiando su propio user_id); se hace vía función security definer
-- que solo puede reclamar una fila cuyo email coincide exactamente con el del usuario
-- autenticado y que todavía no ha sido reclamada (user_id is null). Si existieran
-- varias invitaciones pendientes con el mismo email (mismo cliente invitado por dos
-- entrenadores distintos), se reclama únicamente la más antigua para evitar reclamar
-- varias filas de golpe en una sola llamada.
create or replace function public.claim_client_invite()
returns public.clientes
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
  result public.clientes;
begin
  select id into target_id
  from public.clientes
  where user_id is null
    and lower(email) = lower((select email from auth.users where id = auth.uid()))
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

revoke all on function public.claim_client_invite() from public;
grant execute on function public.claim_client_invite() to authenticated;
