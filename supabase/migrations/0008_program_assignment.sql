-- Permite asignar un programa real del entrenador a un cliente concreto, y añade
-- el acceso de solo-lectura en cascada que necesita el cliente autenticado para
-- ver su plan de entrenamiento asignado desde /client.

alter table public.programas
  add column cliente_id uuid references public.clientes(id) on delete set null;

create index programas_cliente_id_idx on public.programas (cliente_id);

-- Refuerza la política de update del entrenador: si asigna cliente_id, debe ser
-- un cliente que realmente le pertenece (mismo patrón de ownership que 0006).
drop policy if exists "Entrenador actualiza sus propios programas" on public.programas;
create policy "Entrenador actualiza sus propios programas"
  on public.programas for update using (auth.uid() = entrenador_id)
  with check (
    auth.uid() = entrenador_id
    and (
      cliente_id is null
      or exists (
        select 1 from public.clientes
        where clientes.id = programas.cliente_id
        and clientes.entrenador_id = auth.uid()
      )
    )
  );

create policy "Cliente ve su programa asignado"
  on public.programas for select using (
    exists (
      select 1 from public.clientes
      where clientes.id = programas.cliente_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente ve fases de su programa asignado"
  on public.fases_programa for select using (
    exists (
      select 1 from public.programas
      join public.clientes on clientes.id = programas.cliente_id
      where programas.id = fases_programa.programa_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente ve semanas de su programa asignado"
  on public.semanas_programa for select using (
    exists (
      select 1 from public.fases_programa
      join public.programas on programas.id = fases_programa.programa_id
      join public.clientes on clientes.id = programas.cliente_id
      where fases_programa.id = semanas_programa.fase_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente ve entrenamientos de su programa asignado"
  on public.entrenamientos_programa for select using (
    exists (
      select 1 from public.semanas_programa
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      join public.clientes on clientes.id = programas.cliente_id
      where semanas_programa.id = entrenamientos_programa.semana_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente ve bloques de su programa asignado"
  on public.bloques_entrenamiento for select using (
    exists (
      select 1 from public.entrenamientos_programa
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      join public.clientes on clientes.id = programas.cliente_id
      where entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente ve ejercicios en bloques de su programa asignado"
  on public.bloque_ejercicios for select using (
    exists (
      select 1 from public.bloques_entrenamiento
      join public.entrenamientos_programa on entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      join public.clientes on clientes.id = programas.cliente_id
      where bloques_entrenamiento.id = bloque_ejercicios.bloque_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente ve el catalogo de ejercicios de su programa asignado"
  on public.ejercicios for select using (
    exists (
      select 1 from public.bloque_ejercicios
      join public.bloques_entrenamiento on bloques_entrenamiento.id = bloque_ejercicios.bloque_id
      join public.entrenamientos_programa on entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      join public.clientes on clientes.id = programas.cliente_id
      where bloque_ejercicios.ejercicio_id = ejercicios.id
      and clientes.user_id = auth.uid()
    )
  );
