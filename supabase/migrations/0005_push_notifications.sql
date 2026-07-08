-- Suscripciones push (una fila por dispositivo/navegador)
create table public.suscripciones_push (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  dispositivo text,
  navegador text,
  user_agent text,
  creado_en timestamptz not null default now(),
  usado_en timestamptz not null default now(),
  unique (usuario_id, endpoint)
);

alter table public.suscripciones_push enable row level security;

create policy "Usuario ve sus propias suscripciones"
  on public.suscripciones_push for select using (auth.uid() = usuario_id);
create policy "Usuario crea sus propias suscripciones"
  on public.suscripciones_push for insert with check (auth.uid() = usuario_id or usuario_id is null);
create policy "Usuario borra sus propias suscripciones"
  on public.suscripciones_push for delete using (auth.uid() = usuario_id);

create index suscripciones_push_usuario_id_idx on public.suscripciones_push (usuario_id);
create index suscripciones_push_endpoint_idx on public.suscripciones_push (endpoint);

-- Notificaciones (historial en app, además del push)
create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  cuerpo text,
  datos jsonb not null default '{}',
  leido boolean not null default false,
  creado_en timestamptz not null default now()
);

alter table public.notificaciones enable row level security;

create policy "Usuario ve sus propias notificaciones"
  on public.notificaciones for select using (auth.uid() = usuario_id);
create policy "Usuario actualiza sus propias notificaciones"
  on public.notificaciones for update using (auth.uid() = usuario_id);

create index notificaciones_usuario_id_idx on public.notificaciones (usuario_id, creado_en desc);
