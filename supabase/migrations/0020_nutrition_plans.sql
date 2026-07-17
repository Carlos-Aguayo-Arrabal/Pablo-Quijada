-- Planes nutricionales reales con comidas e imagenes. Hasta ahora la pestaña
-- "Nutrición" de la ficha de cliente y el panel del portal cliente mostraban
-- datos de ejemplo fijos en el código; esto los sustituye por datos reales.
-- Sigue el mismo patrón que planes_entrenamiento/programas: una fila de plan
-- por cliente (cliente_id obligatorio aquí, a diferencia de programas, porque
-- no hay concepto de "plantilla nutricional" en el alcance actual).

create table public.planes_nutricionales (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  nombre text not null default 'Plan nutricional',
  calorias_objetivo int,
  proteina_objetivo_g int,
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create unique index planes_nutricionales_cliente_id_key on public.planes_nutricionales (cliente_id);
create index planes_nutricionales_entrenador_id_idx on public.planes_nutricionales (entrenador_id);

alter table public.planes_nutricionales enable row level security;

create policy "Entrenador ve sus propios planes nutricionales"
  on public.planes_nutricionales for select using (auth.uid() = entrenador_id);
create policy "Entrenador crea sus propios planes nutricionales"
  on public.planes_nutricionales for insert with check (auth.uid() = entrenador_id);
create policy "Entrenador actualiza sus propios planes nutricionales"
  on public.planes_nutricionales for update using (auth.uid() = entrenador_id);
create policy "Entrenador borra sus propios planes nutricionales"
  on public.planes_nutricionales for delete using (auth.uid() = entrenador_id);

create policy "Cliente ve su plan nutricional asignado"
  on public.planes_nutricionales for select using (
    exists (
      select 1 from public.clientes
      where clientes.id = planes_nutricionales.cliente_id
      and clientes.user_id = auth.uid()
    )
  );

-- COMIDAS
create table public.comidas_nutricionales (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.planes_nutricionales(id) on delete cascade,
  nombre text not null,
  orden int not null default 0,
  descripcion text,
  calorias int,
  proteina_g int,
  imagen_url text,
  creado_en timestamptz not null default now()
);

create index comidas_nutricionales_plan_id_idx on public.comidas_nutricionales (plan_id);

alter table public.comidas_nutricionales enable row level security;

create policy "Entrenador gestiona comidas de sus planes"
  on public.comidas_nutricionales for all using (
    exists (
      select 1 from public.planes_nutricionales
      where planes_nutricionales.id = comidas_nutricionales.plan_id
      and planes_nutricionales.entrenador_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.planes_nutricionales
      where planes_nutricionales.id = comidas_nutricionales.plan_id
      and planes_nutricionales.entrenador_id = auth.uid()
    )
  );

create policy "Cliente ve comidas de su plan asignado"
  on public.comidas_nutricionales for select using (
    exists (
      select 1 from public.planes_nutricionales
      join public.clientes on clientes.id = planes_nutricionales.cliente_id
      where planes_nutricionales.id = comidas_nutricionales.plan_id
      and clientes.user_id = auth.uid()
    )
  );

-- STORAGE: bucket público de solo-lectura para las fotos de comidas; la
-- escritura queda restringida a la carpeta del propio entrenador
-- (primer segmento de la ruta = su auth.uid()).
insert into storage.buckets (id, name, public)
values ('nutrition-images', 'nutrition-images', true)
on conflict (id) do nothing;

create policy "Entrenadores suben imagenes de comidas en su carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'nutrition-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Entrenadores actualizan sus imagenes de comidas"
  on storage.objects for update
  using (
    bucket_id = 'nutrition-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Entrenadores borran sus imagenes de comidas"
  on storage.objects for delete
  using (
    bucket_id = 'nutrition-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Cualquiera puede ver imagenes de comidas"
  on storage.objects for select
  using (bucket_id = 'nutrition-images');
