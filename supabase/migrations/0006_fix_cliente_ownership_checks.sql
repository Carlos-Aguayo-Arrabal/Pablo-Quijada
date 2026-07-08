-- Las políticas de insert de checkins/mensajes/pagos solo comprobaban
-- auth.uid() = entrenador_id, pero no que cliente_id perteneciera realmente
-- a un cliente de ese mismo entrenador. Esto permitía crear filas que
-- referenciaban el cliente_id de OTRO entrenador (no filtra datos ajenos,
-- porque el select sigue exigiendo entrenador_id = auth.uid(), pero sí
-- permite insertar registros "huérfanos" apuntando a un cliente que no es
-- tuyo). Se añade la comprobación de propiedad vía EXISTS, igual que ya
-- se hace en las tablas de periodización.

drop policy if exists "Entrenador crea checkins de sus clientes" on public.checkins;
create policy "Entrenador crea checkins de sus clientes"
  on public.checkins for insert with check (
    auth.uid() = entrenador_id
    and exists (
      select 1 from public.clientes
      where clientes.id = checkins.cliente_id
      and clientes.entrenador_id = auth.uid()
    )
  );

drop policy if exists "Entrenador actualiza checkins de sus clientes" on public.checkins;
create policy "Entrenador actualiza checkins de sus clientes"
  on public.checkins for update using (auth.uid() = entrenador_id)
  with check (
    auth.uid() = entrenador_id
    and exists (
      select 1 from public.clientes
      where clientes.id = checkins.cliente_id
      and clientes.entrenador_id = auth.uid()
    )
  );

drop policy if exists "Entrenador envia mensajes a sus clientes" on public.mensajes;
create policy "Entrenador envia mensajes a sus clientes"
  on public.mensajes for insert with check (
    auth.uid() = entrenador_id
    and exists (
      select 1 from public.clientes
      where clientes.id = mensajes.cliente_id
      and clientes.entrenador_id = auth.uid()
    )
  );

drop policy if exists "Entrenador crea sus propios pagos" on public.pagos;
create policy "Entrenador crea sus propios pagos"
  on public.pagos for insert with check (
    auth.uid() = entrenador_id
    and exists (
      select 1 from public.clientes
      where clientes.id = pagos.cliente_id
      and clientes.entrenador_id = auth.uid()
    )
  );
