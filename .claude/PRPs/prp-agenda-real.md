# PRP-009: Agenda real del entrenador con sub-navegación por tabs y reserva de citas del cliente

> **Estado**: IMPLEMENTADO (pendiente deploy + prueba manual end-to-end)
> **Fecha**: 2026-07-10
> **Proyecto**: TrainTools

---

## Objetivo

Reemplazar el mock 100% estático de `/dashboard/history` ("Agenda") por un sistema real con 4 sub-secciones en tabs — Calendario, Sesiones agendadas, Tipos de sesión, Horario de citas — respaldado por tablas reales en Supabase con RLS dual entrenador/cliente, y exponer un flujo de reserva de citas self-service en el portal del cliente (`/client`) que consume el horario definido por el entrenador.

## Por Qué

| Problema | Solución |
|----------|----------|
| La Agenda es una lista fija de 4 citas hardcodeadas en `data.ts` inline, sin fecha real ni vínculo a clientes reales | Tabla `sesiones` real con CRUD completo y vista de calendario mensual navegable por mes |
| No hay forma de categorizar sesiones (nutrición, fisioterapia, entrenamiento personal) para organizarlas visualmente | Catálogo `tipos_sesion` (nombre + color) con CRUD propio del entrenador |
| El cliente no puede reservar una cita por su cuenta; todo pasa por mensaje manual y coordinación humana | `franjas_horario` que el entrenador define + flujo de reserva self-service en `/client` que crea una `sesion` real |
| No hay métricas de agenda (cuántas sesiones, % asistencia, cuántas reservó el cliente vs. el entrenador) | Stats calculadas sobre `sesiones` reales en la pestaña "Sesiones agendadas" |

**Valor de negocio**: convierte la Agenda de un mock decorativo en la herramienta operativa diaria del entrenador (qué toca hoy, qué toca esta semana) y reduce la fricción de reserva del cliente (self-service en vez de ida y vuelta por mensaje), lo cual reduce el trabajo administrativo del entrenador — pieza clave para el uso diario real de la app.

## Qué

### Criterios de Éxito
- [ ] `/dashboard/history` (nav "Agenda") muestra 4 tabs — Calendario, Sesiones agendadas, Tipos de sesión, Horario de citas — ninguno usa arrays hardcodeados
- [ ] Tab **Calendario**: vista mensual real con navegación mes anterior/siguiente, día actual resaltado, sesiones del entrenador posicionadas en su fecha real con color según su tipo de sesión
- [ ] Tab **Sesiones agendadas**: listado cronológico de próximas sesiones + stats bar (total, presenciales, online, % asistencia, reservas hechas por el cliente) calculadas sobre datos reales; permite crear, cancelar y marcar como completada una sesión
- [ ] Tab **Tipos de sesión**: CRUD completo (crear, editar, eliminar) del catálogo de tipos propio del entrenador (nombre + color)
- [ ] Tab **Horario de citas**: el entrenador define franjas horarias recurrentes por día de la semana; son la fuente de verdad para la disponibilidad de reserva
- [ ] El cliente autenticado en `/client` puede ver los huecos disponibles de su entrenador y reservar una cita en un slot libre; la reserva crea una sesión real visible en ambos lados (dashboard del entrenador y su propio portal) y puede cancelarla
- [ ] RLS dual (`entrenador_id` directo / cliente vía `clientes.user_id`) habilitado en las 3 tablas nuevas, verificado con `get_advisors`
- [ ] Toda Server Action nueva sigue el patrón de sesión demo ya usado en el resto de la app (`isDemoSession` / `isDemoClientSession` + datos demo de fallback)
- [ ] `npm run typecheck` y `npm run build` pasan sin errores

### Comportamiento Esperado
El entrenador abre `/dashboard/history` → ve el tab "Calendario" por defecto con el mes actual y sus sesiones reales pintadas por color de tipo. Cambia a "Tipos de sesión" y crea "Nutrición" (color ámbar). Cambia a "Horario de citas" y define que martes y jueves de 9:00 a 13:00 acepta citas de 60 min. Vuelve a "Sesiones agendadas" y crea manualmente una cita para un cliente eligiendo tipo, modalidad y fecha/hora → aparece en el listado y en el calendario.

Por su lado, el cliente entra a `/client`, abre la sección de reserva, ve los huecos libres de su entrenador (franjas activas menos sesiones ya ocupadas) para las próximas semanas, elige un martes a las 10:00 → se crea una sesión con `origen = 'cliente'`; el entrenador la ve de inmediato en su Agenda (Calendario y Sesiones agendadas), contabilizada en la métrica "reservas".

---

## Contexto

### Referencias (código existente a seguir como patrón)
- `src/app/(main)/dashboard/history/page.tsx` — página actual 100% mock a reemplazar (array `appointments` inline, sin BD)
- `src/shared/components/sidebar.tsx` — el nav item "Agenda" ya apunta a `/dashboard/history` (icono `History`); no requiere cambio de ruta
- `src/features/clients/components/client-profile-tabs.tsx` — único precedente de sub-navegación por tabs en el proyecto (`'use client'`, `useState<Tab>`, array de tabs, render condicional por tab activo); replicar el mismo patrón para las tabs de Agenda, no inventar uno nuevo
- `src/features/periodization/components/monthly-program-calendar.tsx` — precedente de grid mensual (semanas × 7 columnas, `startOfWeek`, celdas con `min-h-32`); la vista Calendario de Agenda sigue un layout visual similar pero se indexa por `sesiones.fecha_hora` real, no por fases/semanas de programa
- `src/features/checkins/services/actions.ts`, `src/features/performance-tests/services/actions.ts` — patrón exacto de Server Action: `'use server'`, Zod, `isDemoSession()` al inicio con fallback a datos demo, `revalidatePath` tras cada mutación
- `src/features/wellness/services/actions.ts`, `src/features/client/services/actions.ts` — patrón de acceso dual: lado entrenador usa `auth.uid() = entrenador_id` directo; lado cliente primero resuelve su fila en `clientes` vía `user_id = auth.uid()` y luego usa `clientes.id`/`clientes.entrenador_id` para filtrar/insertar
- `src/features/demo/data.ts`, `src/features/demo/auth.ts`, `src/features/demo/server.ts` — sesión demo del entrenador (`isDemoSession`, `DEMO_SESSION_COOKIE`) y del cliente (`isDemoClientSession`, `DEMO_CLIENT_SESSION_COOKIE`); toda Server Action nueva debe chequear la sesión demo correspondiente antes de tocar Supabase
- `src/features/client/demo-data.ts`, `src/features/client/components/client-portal.tsx`, `client-portal-view.tsx` — patrón exacto para añadir un panel nuevo al portal: Server Component que hace `Promise.all` de fetchers y pasa los datos como props a un Client Component
- `supabase/migrations/0007_client_accounts.sql`, `0010_wellness_tests_ai_summary.sql` — precedente exacto de RLS dual entrenador/cliente a seguir sin inventar nada nuevo: entrenador con `auth.uid() = entrenador_id`; cliente con `exists (select 1 from clientes where clientes.id = <tabla>.cliente_id and clientes.user_id = auth.uid())`, e insert siempre validando también `clientes.entrenador_id = <tabla>.entrenador_id`
- `src/types/database.ts` — añadir tipos `Row`/`Insert`/`Update` de las 3 tablas nuevas siguiendo el mismo patrón `Pick`/`Omit` ya usado para el resto
- `.claude/PRPs/prp-dashboard-datos-reales.md` (PRP-002) — precedente directo de "mock → datos reales" en este mismo proyecto; sus aprendizajes documentados (nombres en español, valores de `check` constraint también se traducen, fechas relativas se calculan en cliente) aplican tal cual aquí

### Fuera de Alcance (explícito)
- Sub-sección **"Actividad"** (log de acciones) — exclusión pedida explícitamente por el usuario; queda para un PRP futuro
- Notificaciones push/email al reservar o cancelar una cita — los skills `add-emails`/`add-mobile` ya existen para eso; no se integran automáticamente en este PRP
- Videollamada real integrada para sesiones "Online" — solo se guarda la modalidad como metadato, sin integración Zoom/Meet
- Pagos ligados a una sesión concreta — la tabla `pagos` existente sigue siendo independiente, sin relación a `sesiones` en este PRP
- Reglas de disponibilidad avanzadas (excepciones por fecha, vacaciones, buffer entre citas, límite de reservas por semana por cliente) — el horario de citas de este PRP es un patrón semanal recurrente simple; excepciones puntuales quedan para un PRP futuro si se necesitan
- Recurrencia de sesiones (crear una serie semanal repetida de una vez) — cada sesión se crea individualmente

### Arquitectura Propuesta (Feature-First)
```
src/features/agenda/
├── components/
│   ├── agenda-tabs.tsx              # shell con sub-navegación (Calendario / Sesiones / Tipos / Horario)
│   ├── agenda-calendar-view.tsx     # tab Calendario: grid mensual + navegación de mes
│   ├── sessions-list.tsx            # tab Sesiones agendadas: stats bar + listado + botón nueva cita
│   ├── session-form.tsx             # formulario crear/editar sesión (cliente, tipo, fecha, modalidad)
│   ├── session-types-manager.tsx    # tab Tipos de sesión: CRUD catálogo
│   └── availability-manager.tsx     # tab Horario de citas: CRUD franjas por día de semana
├── services/
│   └── actions.ts                   # listSessions, createSession, updateSessionStatus, cancelSession,
│                                     # getSessionsStats, listSessionTypes, createSessionType,
│                                     # updateSessionType, deleteSessionType, listAvailability,
│                                     # upsertAvailabilitySlot, deleteAvailabilitySlot
└── data.ts                          # tipos SessionRecord/SessionType/AvailabilitySlot + helpers de color/tono

src/features/client/
├── components/
│   └── book-session-panel.tsx       # nuevo panel en el portal: ver huecos libres + reservar + mis sesiones
└── services/actions.ts              # se añaden: listAvailableSlots, bookSession, listMySessions, cancelMySession
```

### Modelo de Datos

Se evita una tabla `reservas` separada de `sesiones` (decisión KISS/YAGNI): "reservas" en las stats de la pestaña Sesiones agendadas es simplemente `count(sesiones where origen = 'cliente')`. Una sesión reservada por el cliente y una creada por el entrenador son conceptualmente la misma entidad con distinto origen; mantener dos tablas obligaría a sincronizarlas.

```sql
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
-- dia_semana: 0=lunes ... 6=domingo (ISO-like, distinto del getDay() de JS que es 0=domingo)
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

-- Sesiones/citas reales (reemplaza el mock de /dashboard/history)
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
```

**Nota de diseño**: la política "Cliente cancela sus propias sesiones" permite técnicamente un `update` sobre cualquier columna de una sesión propia — RLS de Postgres no restringe columnas específicas sin una función dedicada. Igual de laxo que el precedente ya existente en `mensajes` (la política de insert solo exige `remitente = 'cliente'`, no impide insertar otros campos). La Server Action `cancelMySession` es la que en la práctica solo envía `{ estado: 'cancelada' }`. Documentado como gotcha, no bloqueante.

**Nota de diseño**: la prevención de doble reserva del mismo hueco se hace en la Server Action `bookSession` (comprobar que no exista ya una sesión `programada` que se solape para ese entrenador antes de insertar), no con un constraint de BD — mismo patrón "check-then-act" que ya usa `claim_client_invite` (busca y luego actualiza). Aceptable dado el volumen esperado (agenda de un entrenador individual, no alta concurrencia).

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Modelo de datos y RLS en Supabase
**Objetivo**: Migración `0011_agenda.sql` con `tipos_sesion`, `franjas_horario`, `sesiones`, RLS dual completo (entrenador + cliente) e índices; tipos TypeScript añadidos a `src/types/database.ts` siguiendo el patrón `Pick`/`Omit` existente.
**Validación**: `list_tables` confirma las 3 tablas con RLS `enabled = true`; `get_advisors` (tipo security) no reporta hallazgos nuevos.

### Fase 2: Capa de datos y Server Actions de Agenda (lado entrenador)
**Objetivo**: `src/features/agenda/{data.ts, services/actions.ts}` con `listSessions`, `createSession`, `updateSessionStatus`, `cancelSession`, `getSessionsStats`, `listSessionTypes`, `createSessionType`, `updateSessionType`, `deleteSessionType`, `listAvailability`, `upsertAvailabilitySlot`, `deleteAvailabilitySlot` — todas con `isDemoSession()` + datos demo de fallback, validación Zod, `revalidatePath`.
**Validación**: `npm run typecheck` pasa; los datos demo devueltos son coherentes con lo que hoy muestra el mock de `/dashboard/history` (para no perder la sensación de "hay actividad" en modo demo).

### Fase 3: Tab Calendario (vista mensual real)
**Objetivo**: `AgendaTabs` (shell con sub-navegación, patrón `ClientProfileTabs`) + `AgendaCalendarView` reemplazan `history/page.tsx`; grid mensual con navegación mes anterior/siguiente, sesiones reales posicionadas por `fecha_hora`, color por `tipo_sesion`, día actual resaltado.
**Validación**: Playwright screenshot muestra el calendario del mes actual con las sesiones demo/reales en sus días correctos; cambiar de mes actualiza el grid.

### Fase 4: Tab Sesiones agendadas
**Objetivo**: `SessionsList` con stats bar (total, presenciales, online, % asistencia, reservas) + listado cronológico de próximas sesiones + `SessionForm` para crear una cita manual (cliente, tipo, modalidad, fecha/hora) + acciones marcar completada / cancelar.
**Validación**: crear una sesión desde el formulario la refleja de inmediato en el listado y en el tab Calendario; las stats recalculan correctamente tras crear/cancelar.

### Fase 5: Tab Tipos de sesión
**Objetivo**: `SessionTypesManager` con CRUD completo (crear/editar/eliminar tipo con nombre + selector de color); el selector de tipo en `SessionForm` y los colores del calendario consumen este catálogo.
**Validación**: crear un tipo nuevo lo hace disponible de inmediato al crear una sesión; eliminar un tipo en uso no rompe sesiones existentes (`tipo_sesion_id` queda `null` vía `on delete set null`).

### Fase 6: Tab Horario de citas (disponibilidad del entrenador)
**Objetivo**: `AvailabilityManager` con grid semanal (Lunes-Domingo) donde el entrenador define franjas (hora inicio/fin, duración de sesión, activo/inactivo) por día.
**Validación**: las franjas creadas persisten y se listan agrupadas por día; activar/desactivar una franja no la borra.

### Fase 7: Reserva de citas desde el portal del cliente
**Objetivo**: nuevo panel `BookSessionPanel` en `/client` que, vía `listAvailableSlots` (huecos libres = franjas activas del entrenador menos sesiones ya `programada` en ese rango, próximas 2-3 semanas), muestra slots seleccionables; al reservar llama `bookSession` (inserta sesión con `origen = 'cliente'`); el cliente ve sus próximas sesiones y puede cancelarlas (`cancelMySession`).
**Validación**: una reserva hecha desde `/client` aparece de inmediato en el dashboard del entrenador (Calendario y Sesiones agendadas), contabilizada en "reservas"; cancelar desde el cliente actualiza el estado en ambos lados.

### Fase 8: Validación Final
**Objetivo**: sistema de Agenda funcionando end-to-end en ambos lados (dashboard y portal cliente), con datos reales y demo coherentes.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] `get_advisors` sin hallazgos de RLS faltante en las 3 tablas nuevas
- [ ] Prueba manual con 2 cuentas (entrenador + cliente vinculado): el cliente reserva un hueco visible en el horario del entrenador y éste aparece correctamente en el dashboard; el entrenador crea una sesión manual y aparece en el calendario del mes correcto
- [ ] Playwright screenshot de las 4 tabs de `/dashboard/history` y del panel de reserva en `/client`
- [ ] Todos los criterios de éxito de la sección "Qué" cumplidos

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

*(vacío — se completa durante la ejecución del bucle agéntico)*

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] `AgendaTabs` debe ser `'use client'` con `useState<Tab>`, igual que `ClientProfileTabs` — NO usar sub-rutas de Next.js para las tabs (mantiene consistencia con el único precedente de tabs que ya existe en el proyecto)
- [ ] `fecha_hora` se guarda en UTC (`timestamptz`) — toda conversión a hora local para mostrar/agrupar por día en el calendario debe hacerse al renderizar, no al guardar (mismo aprendizaje ya documentado en PRP-002 sobre fechas relativas)
- [ ] Igual que en PRP-002 ("valores de check constraint también hay que traducir"): los valores insertados en columnas con `check (...)` deben ser exactamente `'presencial'`/`'online'`, `'programada'`/`'completada'`/`'cancelada'`/`'no_asistio'`, `'entrenador'`/`'cliente'` — nunca strings en inglés que puedan colarse desde tipos TS de UI
- [ ] `dia_semana` en `franjas_horario` usa `0=lunes...6=domingo` (no el `getDay()` de JS, que es `0=domingo`) — convertir explícitamente al construir la grilla semanal del entrenador y al calcular huecos disponibles para el cliente
- [ ] `listAvailableSlots` debe excluir sesiones `'cancelada'` del cálculo de huecos ocupados (una sesión cancelada libera el hueco)
- [ ] Reutilizar `@/features/demo/server` (`isDemoSession`, `isDemoClientSession`) en cada Server Action nueva — no crear un mecanismo de demo distinto
- [ ] El calendario mensual (`AgendaCalendarView`) NO es el mismo componente que `MonthlyProgramCalendar` (ese es de periodización de programas, indexado por fases/semanas) — es un componente nuevo en `features/agenda/`, solo se toma prestado el patrón visual de grid

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validación Zod en inputs de usuario
- NO usar la `service_role` key de Supabase en código cliente ni en Server Actions (usar siempre `@/lib/supabase/server`)
- NO crear una tabla `reservas` separada de `sesiones` — el origen (`'entrenador'`/`'cliente'`) ya distingue quién la creó
- NO usar sub-rutas de Next.js para las tabs de Agenda (seguir el patrón `useState` de `ClientProfileTabs`)
- NO incluir la sub-sección "Actividad" en este PRP (excluida explícitamente)

---

*PRP pendiente aprobación. No se ha modificado código.*
