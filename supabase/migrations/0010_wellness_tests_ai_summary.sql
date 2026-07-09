-- Cuestionario de bienestar autoinformado por el cliente (distinto del check-in
-- rápido: aquí solo sueño/estrés/dolor/energía estructurados, sin el flujo de
-- aprobación/riesgo que ya tiene `checkins`).
create table public.cuestionarios_bienestar (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  sueno int not null check (sueno between 1 and 10),
  estres int not null check (estres between 1 and 10),
  dolor int not null check (dolor between 1 and 10),
  energia int not null check (energia between 1 and 10),
  notas text,
  creado_en timestamptz not null default now()
);

alter table public.cuestionarios_bienestar enable row level security;

create policy "Entrenador ve cuestionarios de sus clientes"
  on public.cuestionarios_bienestar for select using (auth.uid() = entrenador_id);

create policy "Cliente ve sus propios cuestionarios"
  on public.cuestionarios_bienestar for select using (
    exists (
      select 1 from public.clientes
      where clientes.id = cuestionarios_bienestar.cliente_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Cliente crea sus propios cuestionarios"
  on public.cuestionarios_bienestar for insert with check (
    exists (
      select 1 from public.clientes
      where clientes.id = cuestionarios_bienestar.cliente_id
      and clientes.user_id = auth.uid()
      and clientes.entrenador_id = cuestionarios_bienestar.entrenador_id
    )
  );

create index cuestionarios_bienestar_cliente_id_idx on public.cuestionarios_bienestar (cliente_id);
create index cuestionarios_bienestar_entrenador_id_idx on public.cuestionarios_bienestar (entrenador_id);

-- Tests físicos / de rendimiento, registrados por el entrenador (1RM, tiempos,
-- medidas...). El cliente solo puede leer los suyos, nunca escribir.
create table public.tests_fisicos (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  categoria text not null check (categoria in ('fuerza','resistencia','flexibilidad','medidas','otro')),
  nombre text not null,
  valor numeric not null,
  unidad text not null,
  fecha_test date not null default current_date,
  notas text,
  creado_en timestamptz not null default now()
);

alter table public.tests_fisicos enable row level security;

create policy "Entrenador ve tests de sus clientes"
  on public.tests_fisicos for select using (auth.uid() = entrenador_id);

create policy "Entrenador crea tests de sus clientes"
  on public.tests_fisicos for insert with check (
    auth.uid() = entrenador_id
    and exists (
      select 1 from public.clientes
      where clientes.id = tests_fisicos.cliente_id
      and clientes.entrenador_id = auth.uid()
    )
  );

create policy "Entrenador actualiza tests de sus clientes"
  on public.tests_fisicos for update using (auth.uid() = entrenador_id)
  with check (auth.uid() = entrenador_id);

create policy "Entrenador borra tests de sus clientes"
  on public.tests_fisicos for delete using (auth.uid() = entrenador_id);

create policy "Cliente ve sus propios tests"
  on public.tests_fisicos for select using (
    exists (
      select 1 from public.clientes
      where clientes.id = tests_fisicos.cliente_id
      and clientes.user_id = auth.uid()
    )
  );

create index tests_fisicos_cliente_id_idx on public.tests_fisicos (cliente_id);
create index tests_fisicos_entrenador_id_idx on public.tests_fisicos (entrenador_id);

-- Resumen del estado del atleta generado por IA. Cacheado (historial completo,
-- no se sobrescribe) y de uso exclusivo del entrenador — el cliente no lo ve.
create table public.resumenes_ia (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  estado_general text not null check (estado_general in ('optimo','estable','atencion','riesgo')),
  resumen text not null,
  puntos_clave text[] not null default '{}',
  recomendacion text not null,
  modelo text not null,
  generado_en timestamptz not null default now()
);

alter table public.resumenes_ia enable row level security;

create policy "Entrenador ve resumenes de sus clientes"
  on public.resumenes_ia for select using (auth.uid() = entrenador_id);

create policy "Entrenador crea resumenes de sus clientes"
  on public.resumenes_ia for insert with check (
    auth.uid() = entrenador_id
    and exists (
      select 1 from public.clientes
      where clientes.id = resumenes_ia.cliente_id
      and clientes.entrenador_id = auth.uid()
    )
  );

create index resumenes_ia_cliente_id_idx on public.resumenes_ia (cliente_id, generado_en desc);
