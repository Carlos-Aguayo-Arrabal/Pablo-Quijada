-- Motor de periodizacion: programas -> fases -> semanas -> entrenamientos -> bloques -> ejercicios

create table public.programas (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  duracion_total_semanas int not null check (duracion_total_semanas > 0),
  estado text not null default 'borrador' check (estado in ('borrador','activo','archivado')),
  tipo text not null default 'plantilla' check (tipo in ('plantilla','calendarizado')),
  visibilidad text not null default 'privado' check (visibilidad in ('privado','compartido','publico')),
  permisos jsonb not null default '{}',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.fases_programa (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null references public.programas(id) on delete cascade,
  nombre text not null,
  orden int not null check (orden > 0),
  duracion_semanas int not null check (duracion_semanas > 0),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (programa_id, orden)
);

create table public.semanas_programa (
  id uuid primary key default gen_random_uuid(),
  fase_id uuid not null references public.fases_programa(id) on delete cascade,
  numero_semana int not null check (numero_semana > 0),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (fase_id, numero_semana)
);

create table public.entrenamientos_programa (
  id uuid primary key default gen_random_uuid(),
  semana_id uuid not null references public.semanas_programa(id) on delete cascade,
  dia_semana int not null check (dia_semana between 1 and 7),
  nombre text not null,
  franja_horaria text,
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.bloques_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  entrenamiento_id uuid not null references public.entrenamientos_programa(id) on delete cascade,
  nombre text not null,
  tipo text not null check (tipo in ('movilidad','fuerza','circuito')),
  orden int not null check (orden > 0),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (entrenamiento_id, orden)
);

create table public.ejercicios (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  categoria text not null,
  patron_movimiento text,
  region_corporal text,
  equipamiento text[] not null default '{}',
  lateralidad text not null default 'bilateral' check (lateralidad in ('bilateral','unilateral','alterno','no_aplica')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.bloque_ejercicios (
  id uuid primary key default gen_random_uuid(),
  bloque_id uuid not null references public.bloques_entrenamiento(id) on delete cascade,
  ejercicio_id uuid not null references public.ejercicios(id) on delete restrict,
  etiqueta_superserie text check (etiqueta_superserie is null or etiqueta_superserie ~ '^[A-Z][0-9]+$'),
  series int not null check (series > 0),
  repeticiones text not null,
  rpe_rir text,
  descanso_segundos int check (descanso_segundos is null or descanso_segundos >= 0),
  orden int not null check (orden > 0),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (bloque_id, orden)
);

alter table public.programas enable row level security;
alter table public.fases_programa enable row level security;
alter table public.semanas_programa enable row level security;
alter table public.entrenamientos_programa enable row level security;
alter table public.bloques_entrenamiento enable row level security;
alter table public.ejercicios enable row level security;
alter table public.bloque_ejercicios enable row level security;

create policy "Entrenador ve sus propios programas"
  on public.programas for select using (auth.uid() = entrenador_id);
create policy "Entrenador crea sus propios programas"
  on public.programas for insert with check (auth.uid() = entrenador_id);
create policy "Entrenador actualiza sus propios programas"
  on public.programas for update using (auth.uid() = entrenador_id) with check (auth.uid() = entrenador_id);
create policy "Entrenador borra sus propios programas"
  on public.programas for delete using (auth.uid() = entrenador_id);

create policy "Entrenador ve fases de sus programas"
  on public.fases_programa for select using (
    exists (
      select 1 from public.programas
      where programas.id = fases_programa.programa_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador crea fases en sus programas"
  on public.fases_programa for insert with check (
    exists (
      select 1 from public.programas
      where programas.id = fases_programa.programa_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador actualiza fases de sus programas"
  on public.fases_programa for update using (
    exists (
      select 1 from public.programas
      where programas.id = fases_programa.programa_id
      and programas.entrenador_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.programas
      where programas.id = fases_programa.programa_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador borra fases de sus programas"
  on public.fases_programa for delete using (
    exists (
      select 1 from public.programas
      where programas.id = fases_programa.programa_id
      and programas.entrenador_id = auth.uid()
    )
  );

create policy "Entrenador ve semanas de sus programas"
  on public.semanas_programa for select using (
    exists (
      select 1 from public.fases_programa
      join public.programas on programas.id = fases_programa.programa_id
      where fases_programa.id = semanas_programa.fase_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador crea semanas en sus programas"
  on public.semanas_programa for insert with check (
    exists (
      select 1 from public.fases_programa
      join public.programas on programas.id = fases_programa.programa_id
      where fases_programa.id = semanas_programa.fase_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador actualiza semanas de sus programas"
  on public.semanas_programa for update using (
    exists (
      select 1 from public.fases_programa
      join public.programas on programas.id = fases_programa.programa_id
      where fases_programa.id = semanas_programa.fase_id
      and programas.entrenador_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.fases_programa
      join public.programas on programas.id = fases_programa.programa_id
      where fases_programa.id = semanas_programa.fase_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador borra semanas de sus programas"
  on public.semanas_programa for delete using (
    exists (
      select 1 from public.fases_programa
      join public.programas on programas.id = fases_programa.programa_id
      where fases_programa.id = semanas_programa.fase_id
      and programas.entrenador_id = auth.uid()
    )
  );

create policy "Entrenador ve entrenamientos de sus programas"
  on public.entrenamientos_programa for select using (
    exists (
      select 1 from public.semanas_programa
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where semanas_programa.id = entrenamientos_programa.semana_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador crea entrenamientos en sus programas"
  on public.entrenamientos_programa for insert with check (
    exists (
      select 1 from public.semanas_programa
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where semanas_programa.id = entrenamientos_programa.semana_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador actualiza entrenamientos de sus programas"
  on public.entrenamientos_programa for update using (
    exists (
      select 1 from public.semanas_programa
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where semanas_programa.id = entrenamientos_programa.semana_id
      and programas.entrenador_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.semanas_programa
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where semanas_programa.id = entrenamientos_programa.semana_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador borra entrenamientos de sus programas"
  on public.entrenamientos_programa for delete using (
    exists (
      select 1 from public.semanas_programa
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where semanas_programa.id = entrenamientos_programa.semana_id
      and programas.entrenador_id = auth.uid()
    )
  );

create policy "Entrenador ve bloques de sus programas"
  on public.bloques_entrenamiento for select using (
    exists (
      select 1 from public.entrenamientos_programa
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador crea bloques en sus programas"
  on public.bloques_entrenamiento for insert with check (
    exists (
      select 1 from public.entrenamientos_programa
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador actualiza bloques de sus programas"
  on public.bloques_entrenamiento for update using (
    exists (
      select 1 from public.entrenamientos_programa
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      and programas.entrenador_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.entrenamientos_programa
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador borra bloques de sus programas"
  on public.bloques_entrenamiento for delete using (
    exists (
      select 1 from public.entrenamientos_programa
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      and programas.entrenador_id = auth.uid()
    )
  );

create policy "Entrenador ve sus ejercicios"
  on public.ejercicios for select using (auth.uid() = entrenador_id);
create policy "Entrenador crea sus ejercicios"
  on public.ejercicios for insert with check (auth.uid() = entrenador_id);
create policy "Entrenador actualiza sus ejercicios"
  on public.ejercicios for update using (auth.uid() = entrenador_id) with check (auth.uid() = entrenador_id);
create policy "Entrenador borra sus ejercicios"
  on public.ejercicios for delete using (auth.uid() = entrenador_id);

create policy "Entrenador ve ejercicios en bloques de sus programas"
  on public.bloque_ejercicios for select using (
    exists (
      select 1 from public.bloques_entrenamiento
      join public.entrenamientos_programa on entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where bloques_entrenamiento.id = bloque_ejercicios.bloque_id
      and programas.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador crea ejercicios en bloques de sus programas"
  on public.bloque_ejercicios for insert with check (
    exists (
      select 1 from public.bloques_entrenamiento
      join public.entrenamientos_programa on entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where bloques_entrenamiento.id = bloque_ejercicios.bloque_id
      and programas.entrenador_id = auth.uid()
    )
    and exists (
      select 1 from public.ejercicios
      where ejercicios.id = bloque_ejercicios.ejercicio_id
      and ejercicios.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador actualiza ejercicios en bloques de sus programas"
  on public.bloque_ejercicios for update using (
    exists (
      select 1 from public.bloques_entrenamiento
      join public.entrenamientos_programa on entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where bloques_entrenamiento.id = bloque_ejercicios.bloque_id
      and programas.entrenador_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.bloques_entrenamiento
      join public.entrenamientos_programa on entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where bloques_entrenamiento.id = bloque_ejercicios.bloque_id
      and programas.entrenador_id = auth.uid()
    )
    and exists (
      select 1 from public.ejercicios
      where ejercicios.id = bloque_ejercicios.ejercicio_id
      and ejercicios.entrenador_id = auth.uid()
    )
  );
create policy "Entrenador borra ejercicios en bloques de sus programas"
  on public.bloque_ejercicios for delete using (
    exists (
      select 1 from public.bloques_entrenamiento
      join public.entrenamientos_programa on entrenamientos_programa.id = bloques_entrenamiento.entrenamiento_id
      join public.semanas_programa on semanas_programa.id = entrenamientos_programa.semana_id
      join public.fases_programa on fases_programa.id = semanas_programa.fase_id
      join public.programas on programas.id = fases_programa.programa_id
      where bloques_entrenamiento.id = bloque_ejercicios.bloque_id
      and programas.entrenador_id = auth.uid()
    )
  );

create index programas_entrenador_id_idx on public.programas (entrenador_id);
create index fases_programa_programa_id_idx on public.fases_programa (programa_id);
create index semanas_programa_fase_id_idx on public.semanas_programa (fase_id);
create index entrenamientos_programa_semana_id_idx on public.entrenamientos_programa (semana_id);
create index bloques_entrenamiento_entrenamiento_id_idx on public.bloques_entrenamiento (entrenamiento_id);
create index ejercicios_entrenador_id_idx on public.ejercicios (entrenador_id);
create index bloque_ejercicios_bloque_id_idx on public.bloque_ejercicios (bloque_id);
create index bloque_ejercicios_ejercicio_id_idx on public.bloque_ejercicios (ejercicio_id);
