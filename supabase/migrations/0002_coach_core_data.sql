-- Recrea el esquema en español (la version en ingles se elimina, no tenia datos)
drop table if exists public.messages cascade;
drop table if exists public.checkins cascade;
drop table if exists public.workout_plans cascade;
drop table if exists public.clients cascade;

-- CLIENTES
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  email text not null,
  telefono text,
  servicio text,
  objetivo text,
  estado text not null default 'Pendiente' check (estado in ('Activo','Riesgo','Pendiente','Pausado')),
  adherencia int not null default 0,
  proxima_accion text,
  tipo_proxima_accion text check (tipo_proxima_accion in ('seguimiento','mensaje','pago','plan')),
  ingresos text,
  fecha_inicio date default now(),
  ultima_conexion timestamptz,
  peso text,
  grasa_corporal text,
  energia text,
  notas text,
  riesgos text[] not null default '{}',
  etiquetas text[] not null default '{}',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.clientes enable row level security;

create policy "Entrenador ve sus propios clientes"
  on public.clientes for select using (auth.uid() = entrenador_id);
create policy "Entrenador crea sus propios clientes"
  on public.clientes for insert with check (auth.uid() = entrenador_id);
create policy "Entrenador actualiza sus propios clientes"
  on public.clientes for update using (auth.uid() = entrenador_id);
create policy "Entrenador borra sus propios clientes"
  on public.clientes for delete using (auth.uid() = entrenador_id);

-- PLANES DE ENTRENAMIENTO
create table public.planes_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  categoria text not null,
  nivel text not null default 'Intermedio',
  duracion_semanas int not null default 4,
  sesiones_por_semana int not null default 3,
  clientes_asignados int not null default 0,
  adherencia int not null default 0,
  precio text,
  descripcion text,
  etiquetas text[] not null default '{}',
  dias jsonb not null default '[]',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.planes_entrenamiento enable row level security;
create policy "Entrenador ve sus propios planes"
  on public.planes_entrenamiento for select using (auth.uid() = entrenador_id);
create policy "Entrenador crea sus propios planes"
  on public.planes_entrenamiento for insert with check (auth.uid() = entrenador_id);
create policy "Entrenador actualiza sus propios planes"
  on public.planes_entrenamiento for update using (auth.uid() = entrenador_id);
create policy "Entrenador borra sus propios planes"
  on public.planes_entrenamiento for delete using (auth.uid() = entrenador_id);

-- CHECK-INS (se conserva el termino "checkins", es el mismo que usa la UI)
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  estado text not null default 'Pendiente' check (estado in ('Pendiente','Aprobado','Requiere respuesta')),
  riesgo text not null default 'Bajo' check (riesgo in ('Bajo','Medio','Alto')),
  peso text,
  cambio_peso text,
  energia int,
  sueno int,
  hambre int,
  pasos text,
  adherencia int,
  entrenamientos text,
  nutricion text,
  comentario text,
  alerta text,
  respuesta_sugerida text,
  aprobado_en timestamptz,
  respondido_en timestamptz,
  creado_en timestamptz not null default now()
);

alter table public.checkins enable row level security;
create policy "Entrenador ve checkins de sus clientes"
  on public.checkins for select using (auth.uid() = entrenador_id);
create policy "Entrenador crea checkins de sus clientes"
  on public.checkins for insert with check (auth.uid() = entrenador_id);
create policy "Entrenador actualiza checkins de sus clientes"
  on public.checkins for update using (auth.uid() = entrenador_id);

-- MENSAJES
create table public.mensajes (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  remitente text not null check (remitente in ('entrenador','cliente')),
  contenido text not null,
  leido_en timestamptz,
  creado_en timestamptz not null default now()
);

alter table public.mensajes enable row level security;
create policy "Entrenador ve mensajes de sus clientes"
  on public.mensajes for select using (auth.uid() = entrenador_id);
create policy "Entrenador envia mensajes a sus clientes"
  on public.mensajes for insert with check (auth.uid() = entrenador_id);

-- Indices para listados frecuentes
create index clientes_entrenador_id_idx on public.clientes (entrenador_id);
create index planes_entrenamiento_entrenador_id_idx on public.planes_entrenamiento (entrenador_id);
create index checkins_entrenador_id_idx on public.checkins (entrenador_id);
create index checkins_cliente_id_idx on public.checkins (cliente_id);
create index mensajes_entrenador_id_cliente_id_idx on public.mensajes (entrenador_id, cliente_id);
