-- Estado de descarte del widget de onboarding, 1 fila por entrenador.
-- Las 5 tareas en sí NO se persisten aquí: se calculan on-the-fly contando
-- filas reales en clientes/planes_entrenamiento/franjas_horario/resumenes_ia.
create table public.onboarding_estado (
  entrenador_id uuid primary key references public.profiles(id) on delete cascade,
  descartado boolean not null default false,
  descartado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.onboarding_estado enable row level security;

create policy "Entrenador gestiona su propio estado de onboarding" on public.onboarding_estado
  for all using (auth.uid() = entrenador_id) with check (auth.uid() = entrenador_id);
