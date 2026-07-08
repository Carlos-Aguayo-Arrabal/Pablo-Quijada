create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.profiles(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  concepto text not null,
  monto numeric(10,2) not null,
  moneda text not null default 'EUR',
  estado text not null default 'Pendiente' check (estado in ('Pagado','Pendiente','Vencido')),
  enlace_pago text,
  vence_en date,
  pagado_en timestamptz,
  creado_en timestamptz not null default now()
);

alter table public.pagos enable row level security;

create policy "Entrenador ve sus propios pagos"
  on public.pagos for select using (auth.uid() = entrenador_id);
create policy "Entrenador crea sus propios pagos"
  on public.pagos for insert with check (auth.uid() = entrenador_id);
create policy "Entrenador actualiza sus propios pagos"
  on public.pagos for update using (auth.uid() = entrenador_id);
create policy "Entrenador borra sus propios pagos"
  on public.pagos for delete using (auth.uid() = entrenador_id);

create index pagos_entrenador_id_idx on public.pagos (entrenador_id);
create index pagos_cliente_id_idx on public.pagos (cliente_id);
