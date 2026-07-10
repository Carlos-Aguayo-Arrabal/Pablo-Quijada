# PRP-010: Widget de onboarding gamificado del entrenador (icono de regalo + checklist real)

> **Estado**: IMPLEMENTADO (pendiente deploy + prueba manual end-to-end)
> **Fecha**: 2026-07-10
> **Proyecto**: TrainTools

---

## Objetivo

Añadir al dashboard del entrenador un botón flotante en forma de regalo (esquina inferior izquierda) con badge "X/5" que, al pulsarlo, abre un panel "Explora TrainTools" con una barra de progreso y una checklist de 5 primeros pasos reales de la app; cada paso detecta automáticamente si ya está hecho consultando datos reales en Supabase (no se marca a mano) y enlaza a la pantalla exacta si falta por completar.

## Por Qué

| Problema | Solución |
|----------|----------|
| Un entrenador nuevo llega a un dashboard vacío (0 clientes, 0 planes, sin agenda configurada) y no sabe por dónde empezar | Checklist gamificada de 5 pasos concretos, siempre visible hasta completarse, que guía la primera sesión de uso |
| No hay señal visual de "cuánto me falta para tener la app funcionando de verdad" | Badge "X/5" + barra de progreso, siempre basados en datos reales (clientes, planes, agenda, resumen IA), nunca en un checkbox manual que se puede mentir a sí mismo |
| El entrenador puede olvidar pasos clave de configuración (horario de citas) que bloquean funcionalidades ya construidas (reserva self-service del cliente, PRP-009) | Cada tarea enlaza directo a la pantalla donde se completa, cerrando el círculo entre "descubrir la función" y "usarla" |

**Valor de negocio**: mejora la activación temprana (time-to-value) del entrenador recién registrado, aumentando la probabilidad de que descubra y use las features ya construidas (invitar cliente, crear plan, agenda, resumen IA) en su primera sesión — reduce abandono en el "vacío" post-signup.

## Qué

### Criterios de Éxito
- [ ] Botón flotante circular (icono regalo, `lucide-react` `Gift`) fijo en la esquina inferior izquierda del dashboard del entrenador, con badge numérico "X/5" que refleja tareas completadas reales
- [ ] Al hacer clic abre un panel "Explora TrainTools" con barra de progreso (X/5) y checklist de 5 tareas: crear cuenta, invitar primer cliente, crear primer plan de entrenamiento, configurar horario de citas en la Agenda, generar primer resumen de IA de un cliente
- [ ] Cada tarea se marca como completada consultando datos reales en Supabase (no hay checkbox manual en ninguna tarea) — recalculado en cada carga de página, sin caché obsoleta
- [ ] Cada tarea pendiente muestra un enlace ("Ir a...") a la pantalla exacta donde se completa; las completadas muestran un check y no son clicables
- [ ] El panel se puede cerrar/minimizar (vuelve a mostrarse solo el botón flotante) sin perder el progreso
- [ ] El botón flotante deja de aparecer solo cuando las 5 tareas están completas o cuando el entrenador lo descarta explícitamente ("No mostrar más"); ese descarte persiste en Supabase por entrenador (sobrevive a recargar página, cerrar sesión, cambiar de dispositivo)
- [ ] El widget NO aparece en modo demo (`isDemoSession()`) ni en el portal del cliente (`/client`) — es exclusivo del dashboard real del entrenador autenticado
- [ ] RLS habilitado en la tabla nueva, verificado con `get_advisors`
- [ ] `npm run typecheck` y `npm run build` pasan sin errores

### Comportamiento Esperado
Un entrenador recién registrado entra a `/dashboard` y ve, en la esquina inferior izquierda, un botón circular con icono de regalo y badge "1/5" (la tarea "Crear cuenta" ya cuenta como hecha porque se auto-completa al registrarse). Al pulsarlo se abre el panel "Explora TrainTools": barra de progreso al 20% y una lista con "Crear tu cuenta ✓", y 4 tareas pendientes con su enlace ("Invita a tu primer cliente → Invitar cliente", "Crea tu primer plan de entrenamiento → Nuevo plan", "Configura tu horario de citas → Agenda", "Genera tu primer resumen con IA → Clientes"). El entrenador pulsa "Invita a tu primer cliente", completa el formulario ya existente en `/dashboard/clients/new`, vuelve al dashboard, y el badge pasa a "2/5" automáticamente porque ahora existe una fila real en `clientes`. Repite hasta llegar a 5/5, momento en el que el widget deja de aparecer en visitas futuras. En cualquier momento puede minimizar el panel (el botón sigue accesible) o descartarlo del todo con "No mostrar más".

---

## Contexto

### Referencias (código existente a seguir como patrón)
- `src/app/(main)/layout.tsx` — shell del dashboard del entrenador; ya resuelve `user`/`demoSession` y monta condicionalmente componentes flotantes solo para sesión real (`{user && !demoSession && <PushNotificationPrompt userId={user.id} />}`); el widget de onboarding se monta aquí con el mismo gate, obteniendo su estado en el mismo `Promise.all` que ya arma `userName`/`notifications`
- `src/features/notifications/components/push-notification-prompt.tsx` — único precedente de componente flotante `fixed bottom-4 right-4 z-50` con estado abrir/cerrar; el widget de onboarding sigue el mismo patrón visual pero en `bottom-4 left-4`, con estado inicial obtenido por props desde el servidor (no `localStorage`, porque el descarte debe persistir en Supabase, no solo en el navegador)
- `src/features/clients/components/client-profile-tabs.tsx` — patrón de tabs con `useState`, ya reutilizado en Agenda; no aplica directamente aquí (el widget no tiene tabs) pero confirma el estilo de componente `'use client'` con estado local simple
- `src/features/ai-summary/services/actions.ts` (`getLatestSummary`, `generateClientSummary`) — patrón exacto de Server Action que devuelve `null`/mensaje de error en modo demo (`if (await isDemoSession()) return null`); el widget de onboarding sigue el mismo gate para no exponer progreso real en modo demo
- `src/features/clients/services/actions.ts` (`getClientsSummary`) — patrón de conteos agregados con `select('id', { count: 'exact', head: true })` y `Promise.all`; se reutiliza el mismo estilo para contar `clientes`, `planes_entrenamiento`, `franjas_horario`, `resumenes_ia` del entrenador
- `src/features/agenda/services/actions.ts` (`upsertAvailabilitySlot`) — patrón de upsert `id ? update : insert` sobre una fila propia del entrenador; el mismo patrón aplica para el registro 1-a-1 de `onboarding_estado` (upsert por `entrenador_id`)
- `src/features/agenda/components/agenda-tabs.tsx` — hoy el tab activo es un `useState` sin lectura de query param (`activeTab` siempre arranca en `'Calendario'`); la tarea "Configura tu horario de citas" necesita enlazar directo al tab "Horario de citas", así que este componente necesita una pequeña extensión para aceptar una pestaña inicial vía URL
- `src/app/(main)/dashboard/history/page.tsx` — Server Component de la página Agenda; necesita leer `searchParams` y pasarlo como pestaña inicial a `AgendaTabs`
- `supabase/migrations/0001_profiles.sql` — trigger `handle_new_user` que crea la fila en `profiles` automáticamente al signup; confirma que la tarea "Crear cuenta" siempre está completa para cualquier usuario real autenticado (no necesita query, basta con que exista `user`)
- `supabase/migrations/0011_agenda.sql` — precedente exacto de tabla simple `entrenador_id` con RLS de un solo `for all using (auth.uid() = entrenador_id)`, a seguir para `onboarding_estado`
- `src/types/database.ts` — añadir el tipo `Row`/`Insert`/`Update` de la tabla nueva siguiendo el mismo patrón `Pick`/`Omit` ya usado

### Fuera de Alcance (explícito)
- Copiar literalmente los pasos/copy de Harbiz — se usan los 5 pasos reales ya definidos por el usuario, adaptados al vocabulario de TrainTools
- Notificaciones push/email cuando se completa una tarea — no se integra `add-emails`/`add-mobile` en este PRP
- Progreso o widget visible en el portal del cliente (`/client`) — exclusivo del dashboard del entrenador
- Edición manual de tareas (marcar/desmarcar a mano) — el requisito explícito es detección 100% automática desde datos reales
- Onboarding multi-paso tipo wizard bloqueante (modal a pantalla completa que impide navegar) — el widget es no-modal, el entrenador puede ignorarlo y seguir usando la app
- Reabrir el widget tras un descarte explícito (no hay UI para "deshacer" el "No mostrar más" en este PRP; si se necesita, es un PRP futuro con un toggle en `/dashboard/settings`)

### Arquitectura Propuesta (Feature-First)
```
src/features/onboarding/
├── components/
│   ├── onboarding-widget.tsx       # 'use client': botón flotante + badge + panel "Explora TrainTools"
│   └── onboarding-task-item.tsx    # fila de checklist: icono estado, label, CTA/enlace
├── services/
│   └── actions.ts                  # getOnboardingStatus(), dismissOnboarding()
└── data.ts                         # tipo OnboardingTask + definición estática de las 5 tareas (label, href, description)
```

### Modelo de Datos

Las 5 tareas NO se persisten individualmente: su estado se calcula en cada carga consultando las tablas ya existentes (`clientes`, `planes_entrenamiento`, `franjas_horario`, `resumenes_ia`). Lo único que necesita persistencia por entrenador es si el widget fue descartado explícitamente (para que no reaparezca en otra sesión/dispositivo) — igual de mínimo que el resto del esquema (KISS/YAGNI, mismo espíritu que la decisión de no crear tabla `reservas` en PRP-009).

```sql
-- Estado de descarte del widget de onboarding, 1 fila por entrenador
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
```

**Cálculo de cada tarea (en `getOnboardingStatus`)**:
1. `crearCuenta`: siempre `true` si hay `user` autenticado no-demo (la fila en `profiles` la crea el trigger `handle_new_user` en el signup) — no requiere query.
2. `invitarPrimerCliente`: `count(*) from clientes where entrenador_id = user.id` > 0 → enlaza a `/dashboard/clients/new`.
3. `crearPrimerPlan`: `count(*) from planes_entrenamiento where entrenador_id = user.id` > 0 → enlaza a `/dashboard/workouts/new`.
4. `configurarHorario`: `count(*) from franjas_horario where entrenador_id = user.id` > 0 → enlaza a `/dashboard/history?tab=horario`.
5. `generarResumenIA`: `count(*) from resumenes_ia where entrenador_id = user.id` > 0 → enlaza a `/dashboard/clients`.

**Decisión de diseño — auto-cierre al completar el 5/5**: cuando `getOnboardingStatus()` detecta que las 5 tareas están completas y `descartado` sigue en `false`, hace un upsert marcando `descartado = true` en la misma llamada (tras devolver el estado 5/5 para que el frontend pueda mostrar un instante de "¡Completado!" antes de que desaparezca en la siguiente carga). Así se cumple literalmente el criterio "deja de ser accesible cuando se completan todas las tareas o el usuario lo descarta explícitamente" sin necesitar un botón adicional de "cerrar para siempre" al llegar al 100%.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Modelo de datos y RLS en Supabase
**Objetivo**: Migración `0012_onboarding.sql` con la tabla `onboarding_estado` y su política RLS `for all using (auth.uid() = entrenador_id)`; tipos `Row`/`Insert`/`Update` añadidos a `src/types/database.ts` siguiendo el patrón existente.
**Validación**: `list_tables` confirma la tabla con RLS `enabled = true`; `get_advisors` (tipo security) no reporta hallazgos nuevos.

### Fase 2: Capa de datos y Server Actions de onboarding
**Objetivo**: `src/features/onboarding/{data.ts, services/actions.ts}` con `getOnboardingStatus()` (calcula las 5 tareas con conteos reales vía `Promise.all` estilo `getClientsSummary`, lee/gestiona `descartado`, y aplica el auto-cierre al 5/5 descrito arriba) y `dismissOnboarding()` (upsert `descartado = true`); ambas con gate `isDemoSession()` devolviendo `null`/no-op, igual que `ai-summary/services/actions.ts`.
**Validación**: `npm run typecheck` pasa; probar manualmente que `getOnboardingStatus()` devuelve conteos correctos para una cuenta de prueba con 0, 2 y 5 tareas completas.

### Fase 3: Deep-link al tab "Horario de citas" desde Agenda
**Objetivo**: `AgendaTabs` (`src/features/agenda/components/agenda-tabs.tsx`) acepta una pestaña inicial vía prop derivada de `searchParams` (p. ej. `?tab=horario` → `'Horario de citas'`), sin romper el comportamiento actual por defecto (`'Calendario'`) cuando no hay query param; `src/app/(main)/dashboard/history/page.tsx` lee `searchParams` y la pasa.
**Validación**: navegar a `/dashboard/history?tab=horario` abre directamente el tab "Horario de citas"; `/dashboard/history` sin query param sigue abriendo "Calendario" como hoy.

### Fase 4: Widget flotante "Explora TrainTools"
**Objetivo**: `OnboardingWidget` (botón circular icono `Gift` + badge "X/5" fijo en `bottom-4 left-4`) y `OnboardingTaskItem` (fila con icono de estado, label, y enlace si está pendiente); el panel muestra barra de progreso y las 5 tareas en orden; se puede minimizar (vuelve al botón) sin perder datos. Montado en `src/app/(main)/layout.tsx` junto a `PushNotificationPrompt`, con el mismo gate `user && !demoSession`, obteniendo el estado inicial de `getOnboardingStatus()` en el `Promise.all` server-side ya existente del layout.
**Validación**: Playwright screenshot del botón colapsado con badge, del panel abierto con progreso parcial, y confirmación visual de que no aparece en modo demo ni en `/client`.

### Fase 5: Descarte explícito y validación final
**Objetivo**: botón "No mostrar más" en el panel que llama `dismissOnboarding()`; verificación end-to-end de que completar cada una de las 5 tareas reales (crear cliente, crear plan, configurar franja horaria, generar resumen IA) actualiza el badge sin recargar manualmente estado obsoleto, y que tras 5/5 o tras descarte explícito el widget deja de aparecer en la siguiente carga.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] `get_advisors` sin hallazgos de RLS faltante en `onboarding_estado`
- [ ] Prueba manual con una cuenta de entrenador nueva: badge arranca en 1/5, sube a 2/5 tras invitar un cliente, a 3/5 tras crear un plan, a 4/5 tras configurar horario, a 5/5 tras generar un resumen IA, y el widget desaparece en la siguiente carga
- [ ] Prueba manual de "No mostrar más" antes de completar todo: el widget no reaparece tras recargar ni tras cerrar/abrir sesión
- [ ] Todos los criterios de éxito de la sección "Qué" cumplidos

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

*(vacío — se completa durante la ejecución del bucle agéntico)*

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] El widget NUNCA debe renderizarse en modo demo (`isDemoSession()`) ni en `/client` — sigue el mismo gate que `PushNotificationPrompt` en `MainLayout` (`user && !demoSession`)
- [ ] La tarea "Crear cuenta" NO requiere query a Supabase — está completa por definición para cualquier `user` real autenticado (el trigger `handle_new_user` de `0001_profiles.sql` garantiza la fila en `profiles`)
- [ ] `AgendaTabs` hoy no lee ningún query param (`useState('Calendario')` fijo) — al añadir soporte de pestaña inicial, no romper la navegación existente sin `?tab=`
- [ ] El descarte ("No mostrar más") y el auto-cierre al 5/5 se persisten en Supabase (`onboarding_estado.descartado`), NO en `localStorage` — a diferencia de `push-prompt-dismissed` (que sí es local), este debe sobrevivir a cambio de dispositivo/navegador porque el criterio de éxito lo exige explícitamente
- [ ] `getOnboardingStatus()` recalcula los conteos en cada carga de página (Server Component, sin caché de cliente) — evita que el badge muestre un número obsoleto tras completar una tarea y volver al dashboard
- [ ] Reutilizar `@/features/demo/server` (`isDemoSession`) — no crear un mecanismo de demo distinto
- [ ] `onboarding_estado` es una tabla 1 fila por entrenador (PK = `entrenador_id`) — usar upsert (`id ? update : insert` o `upsert()` de Supabase), igual que el patrón ya usado en `upsertAvailabilitySlot`

## Anti-Patrones

- NO copiar literalmente los pasos/copy de Harbiz — usar los 5 pasos reales ya definidos, con vocabulario de TrainTools
- NO añadir un checkbox manual en ninguna tarea — toda detección es automática desde datos reales en Supabase
- NO crear una tabla separada por tarea o un tracker granular de eventos — un único row de `descartado` por entrenador basta; el resto se computa on the fly
- NO usar `localStorage` para el descarte explícito — debe persistir en Supabase por entrenador
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes en `data.ts` para las 5 tareas)
- NO omitir validación Zod en inputs de usuario (aplica a `dismissOnboarding` si recibe parámetros)
- NO usar la `service_role` key de Supabase en código cliente ni en Server Actions (usar siempre `@/lib/supabase/server`)
- NO mostrar el widget en el portal del cliente (`/client`) ni en modo demo

---

*PRP pendiente aprobación. No se ha modificado código.*
