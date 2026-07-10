-- Catálogo de tipos de sesión del entrenador (nombre + color)
create table public.tipos_sesion (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  color text not null default '#FF6A00',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Franjas horarias recurrentes que el entrenador ofrece para reserva.
-- dia_semana: 0=lunes ... 6=domingo (distinto del getDay() de JS, que es 0=domingo)
create table public.franjas_horario (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null check (hora_fin > hora_inicio),
  duracion_sesion_minutos int not null default 60 check (duracion_sesion_minutos > 0),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Sesiones/citas reales (reemplaza el mock de /dashboard/history).
-- No hay tabla "reservas" separada: origen distingue quién la creó.
create table public.sesiones (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  tipo_sesion_id uuid references public.tipos_sesion(id) on delete set null,
  titulo text not null,
  modalidad text not null check (modalidad in ('presencial','online')),
  fecha_hora timestamptz not null,
  duracion_minutos int not null default 60 check (duracion_minutos > 0),
  estado text not null default 'programada' check (estado in ('programada','completada','cancelada','no_asistio')),
  origen text not null default 'entrenador' check (origen in ('entrenador','cliente')),
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.tipos_sesion enable row level security;
alter table public.franjas_horario enable row level security;
alter table public.sesiones enable row level security;

-- tipos_sesion: entrenador CRUD completo sobre lo suyo; cliente solo lectura de los tipos de su propio entrenador
create policy "Entrenador gestiona sus tipos de sesion" on public.tipos_sesion
  for all using (auth.uid() = entrenador_id) with check (auth.uid() = entrenador_id);

create policy "Cliente ve tipos de sesion de su entrenador" on public.tipos_sesion
  for select using (
    exists (select 1 from public.clientes where clientes.entrenador_id = tipos_sesion.entrenador_id and clientes.user_id = auth.uid())
  );

-- franjas_horario: entrenador CRUD completo; cliente solo lectura (para calcular huecos libres)
create policy "Entrenador gestiona sus franjas" on public.franjas_horario
  for all using (auth.uid() = entrenador_id) with check (auth.uid() = entrenador_id);

create policy "Cliente ve franjas de su entrenador" on public.franjas_horario
  for select using (
    exists (select 1 from public.clientes where clientes.entrenador_id = franjas_horario.entrenador_id and clientes.user_id = auth.uid())
  );

-- sesiones: entrenador CRUD completo; cliente lee las suyas, crea las suyas (origen='cliente'), cancela las suyas
create policy "Entrenador gestiona sus sesiones" on public.sesiones
  for all using (auth.uid() = entrenador_id) with check (auth.uid() = entrenador_id);

create policy "Cliente ve sus propias sesiones" on public.sesiones
  for select using (
    exists (select 1 from public.clientes where clientes.id = sesiones.cliente_id and clientes.user_id = auth.uid())
  );

create policy "Cliente reserva sus propias sesiones" on public.sesiones
  for insert with check (
    origen = 'cliente'
    and exists (
      select 1 from public.clientes
      where clientes.id = sesiones.cliente_id
      and clientes.user_id = auth.uid()
      and clientes.entrenador_id = sesiones.entrenador_id
    )
  );

create policy "Cliente cancela sus propias sesiones" on public.sesiones
  for update using (
    exists (select 1 from public.clientes where clientes.id = sesiones.cliente_id and clientes.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.clientes where clientes.id = sesiones.cliente_id and clientes.user_id = auth.uid())
  );

create index tipos_sesion_entrenador_id_idx on public.tipos_sesion (entrenador_id);
create index franjas_horario_entrenador_id_idx on public.franjas_horario (entrenador_id);
create index sesiones_entrenador_id_idx on public.sesiones (entrenador_id, fecha_hora);
create index sesiones_cliente_id_idx on public.sesiones (cliente_id);
