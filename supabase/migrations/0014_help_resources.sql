-- Fila global (singleton) con los enlaces de "Manuales de usuario" y "Video tutoriales"
-- que se muestran en el login. Lectura pública porque el login es una página sin sesión;
-- escritura restringida a cuentas de entrenador (clientes también son `authenticated`,
-- así que se descartan comprobando que su user_id no tenga fila en `clientes`).

create table if not exists public.recursos_ayuda (
  id uuid primary key default gen_random_uuid(),
  manual_url text,
  video_url text,
  actualizado_en timestamptz not null default now()
);

alter table public.recursos_ayuda enable row level security;

create policy "Cualquiera puede leer los recursos de ayuda"
  on public.recursos_ayuda for select
  using (true);

create policy "Solo entrenadores pueden actualizar los recursos de ayuda"
  on public.recursos_ayuda for update
  using (not exists (select 1 from public.clientes where user_id = auth.uid()))
  with check (not exists (select 1 from public.clientes where user_id = auth.uid()));

insert into public.recursos_ayuda (manual_url, video_url)
select null, null
where not exists (select 1 from public.recursos_ayuda);
