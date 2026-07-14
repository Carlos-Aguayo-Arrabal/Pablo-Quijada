-- La política de UPDATE de recursos_ayuda (0014) solo comprobaba "no soy un cliente"
-- (`not exists (select 1 from clientes where user_id = auth.uid())`), lo cual también es
-- cierto para el rol anónimo: auth.uid() es null cuando no hay sesión, y ninguna fila de
-- clientes tiene user_id null, así que la comprobación pasaba igual. Un visitante sin
-- sesión podría sobreescribir estos enlaces llamando directamente a la API REST de
-- Supabase. Se añade auth.role() = 'authenticated' para exigir una sesión real además de
-- no ser cliente.

drop policy if exists "Solo entrenadores pueden actualizar los recursos de ayuda" on public.recursos_ayuda;

create policy "Solo entrenadores pueden actualizar los recursos de ayuda"
  on public.recursos_ayuda for update
  using (
    auth.role() = 'authenticated'
    and not exists (select 1 from public.clientes where user_id = auth.uid())
  )
  with check (
    auth.role() = 'authenticated'
    and not exists (select 1 from public.clientes where user_id = auth.uid())
  );
