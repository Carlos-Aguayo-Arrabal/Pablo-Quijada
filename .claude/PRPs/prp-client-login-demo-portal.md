# PRP-007: Login real de clientes + modo demo del portal cliente

> **Estado**: IMPLEMENTADO (pendiente deploy + prueba real end-to-end)
> **Fecha**: 2026-07-09
> **Proyecto**: TrainTools

---

## Objetivo

Dar a los clientes del entrenador una cuenta propia (Supabase Auth + RLS) para ver su plan, check-ins, mensajes y pagos reales en `/client`, y sustituir la maqueta estática actual de `/client` por un modo demo interactivo (sin escribir en la base de datos) que siga el mismo patrón de sesión demo ya usado en el lado entrenador (`demo@traintools.es`).

## Por Qué

| Problema | Solución |
|----------|----------|
| `/client` es 100% maqueta: datos hardcodeados (`exercises`, `meals`, `habits`, cliente "Laura") y el único guardado es `localStorage` del navegador. Ningún cliente real puede entrar. | Cargar datos reales desde Supabase para el cliente autenticado (`clientes.user_id = auth.uid()`), con fallback a modo demo cuando no hay sesión real. |
| "Invitar cliente" (`InviteClientForm` → `createClient`) solo crea una fila CRM en `clientes`. El "enlace de invitación" que se muestra (`/client/invite/{slug}`) es una URL inventada que no existe como ruta. El cliente invitado nunca puede crear una cuenta. | Generar un enlace de registro real y un flujo de vinculación email → `auth.users.id` → `clientes.user_id`. |
| El middleware actual (`src/lib/supabase/proxy.ts`) trata `/dashboard` y `/client` como la misma "ruta protegida": cualquier usuario autenticado (o con la cookie demo del entrenador) puede entrar a ambas. Un cliente real podría abrir `/dashboard` y viceversa. | Separar roles: un usuario con fila en `clientes.user_id` es "cliente" (solo `/client`); el resto son "entrenador" (solo `/dashboard`). |
| No existe una demo del portal cliente equivalente a `demo@traintools.es`: hoy la única "demo" es la maqueta estática que ve todo el mundo en `/client`, sin login ni distinción de modo. | Añadir una sesión demo de cliente (cookie propia, mismo patrón que `DEMO_SESSION_COOKIE`) que permita interactuar con todo (rutinas, check-ins, mensajes) sin persistir nada. |

**Valor de negocio**: convierte `/client` de un mockup de venta en un producto usable de verdad (retención del cliente final, valor percibido del servicio del entrenador) y cierra un hueco de seguridad real (cruce de roles) antes de tener usuarios reales en producción.

## Qué

### Criterios de Éxito
- [ ] Un cliente invitado por el entrenador puede crear su contraseña y entrar a `/client` con su cuenta real (Supabase Auth), viendo solo sus propios datos.
- [ ] Un entrenador autenticado no puede acceder a `/client` con datos de otro cliente, y un cliente autenticado no puede acceder a `/dashboard` (verificado a nivel de middleware + RLS, no solo de UI).
- [ ] `/client` sin sesión ofrece un botón de "modo demo" que permite completar ejercicios, registrar hábitos, enviar un check-in y mandar un mensaje al coach sin crear ni modificar ninguna fila en Supabase.
- [ ] Los check-ins y mensajes enviados por un cliente real desde `/client` aparecen en el panel del entrenador (`/dashboard/checkins`, `/dashboard/messages`) igual que los datos sembrados manualmente hoy.
- [ ] `npm run typecheck` y `npm run build` pasan; `mcp__supabase__get_advisors` no reporta tablas nuevas sin RLS.

### Comportamiento Esperado (Happy Path)
1. El entrenador invita a un cliente desde `/dashboard/clients/new` → se crea la fila en `clientes` (como hoy) y además se genera un enlace de registro real.
2. El cliente abre el enlace, crea su contraseña (`supabase.auth.signUp`), y el sistema vincula ese `auth.users.id` a su fila `clientes` existente por email (vía función `security definer`, no por RLS directa).
3. El cliente inicia sesión en el mismo formulario de login; el sistema detecta que es "cliente" (existe `clientes.user_id = auth.uid()`) y lo redirige a `/client` en vez de `/dashboard`.
4. `/client` muestra su plan asignado (si el entrenador le asignó un `programa` real), sus hábitos, y permite mandar check-in/mensaje, todo persistido en Supabase con RLS restringida a sus propias filas.
5. Un visitante sin cuenta que llega a `/client` puede pulsar "Ver demo" y usar el portal completo (marcar ejercicios, timers, check-in, chat) con datos de ejemplo, sin tocar la base de datos — igual que "Entrar a demo completa" ya hace hoy para el entrenador.

---

## Contexto

### Referencias (código investigado)

- `src/lib/supabase/proxy.ts` — middleware actual: `/dashboard` y `/client` comparten la misma condición `isProtectedRoute` sin distinguir rol. Hay que introducir el chequeo de rol aquí.
- `src/features/demo/auth.ts` y `src/features/demo/server.ts` — patrón de sesión demo del entrenador: cookie httpOnly (`vq_demo_session`) + helpers `isDemoSession`/`setDemoSession`/`clearDemoSession`. El modo demo de cliente debe replicar este patrón con su propia cookie (p.ej. `vq_demo_client_session`), no reutilizar la del entrenador.
- `src/actions/auth.ts` (`login`, `signout`) — hoy `login()` solo distingue demo-entrenador vs Supabase; no hay concepto de rol tras el login real. `signout()` limpia `DEMO_SESSION_COOKIE`; deberá limpiar también la cookie demo de cliente.
- `src/features/auth/components/login-form.tsx` — único formulario de login, hardcodeado para redirigir a `/dashboard`. Debe soportar la redirección condicional por rol (o detectarla server-side tras `login()`).
- `src/types/database.ts` + `supabase/migrations/0001_profiles.sql` — **el trigger `handle_new_user` crea una fila en `profiles` para CUALQUIER signup**, incluidos futuros clientes. El rol NO se puede inferir por "tiene `profiles`"; debe inferirse por "existe `clientes.user_id = auth.uid()`".
- `supabase/migrations/0002_coach_core_data.sql` — tabla `clientes` no tiene ninguna columna que la vincule a `auth.users`. Solo tiene `entrenador_id` (dueño CRM) y `email` (texto libre, sin relación).
- `supabase/migrations/0004_periodization_engine.sql` — el motor de programas (`programas → fases_programa → semanas_programa → entrenamientos_programa → bloques_entrenamiento → bloque_ejercicios`) es enteramente propiedad del entrenador (`entrenador_id`). **No existe ninguna columna que asigne un programa a un cliente concreto.** Sin esto, "ver su plan real" no tiene de dónde leer.
- `supabase/migrations/0006_fix_cliente_ownership_checks.sql` — patrón ya usado para reforzar RLS de inserts vía `EXISTS (... and clientes.entrenador_id = auth.uid())`; el mismo patrón de `EXISTS` aplica para las políticas de cliente (`clientes.user_id = auth.uid()`).
- `src/features/clients/services/actions.ts` (`createClient`) — hoy solo inserta la fila CRM; no crea cuenta de auth ni enlace real.
- `src/features/clients/components/invite-client-form.tsx` — genera `inviteUrl` con un slug inventado (`/client/invite/{slug}`), ruta que no existe en `src/app`. Hay que sustituirlo por un enlace real de registro.
- `src/features/checkins/services/actions.ts`, `src/features/messages/services/actions.ts`, `src/features/clients/services/actions.ts` — patrón de server actions ya consolidado: `if (await isDemoSession()) return getDemo...()`, luego Supabase real, con fallback a demo si la query real viene vacía o con error. El nuevo `features/client/services/actions.ts` debe seguir el mismo patrón, pero comprobando `isDemoClientSession()` y resolviendo el `cliente_id` real vía `clientes.user_id = auth.uid()`.
- `src/features/demo/data.ts` — ya expone `getDemoClients`, `getDemoCheckIns`, `getDemoMessages`, `getDemoWorkoutPlans`, etc. Hay que revisar si conviene añadir semillas dedicadas a la vista de cliente o reutilizar las existentes desde la perspectiva de un cliente concreto (`demoClientIds`).
- `src/features/client/components/client-portal.tsx` — maqueta completa (~640 líneas) con `exercises`, `habits`, `meals` hardcodeados y persistencia únicamente en `localStorage` (`client-portal:*`). Excede el límite de 500 líneas del proyecto; al reconstruirlo hay que dividirlo en subcomponentes (`workout-panel`, `checkin-form`, `messages-panel`, `habits-panel`, etc.) dentro de `src/features/client/components/`.
- `src/shared/components/workspace-actions.tsx` — ya soporta `mode="client"` (notificaciones/ajustes), usado por `client-portal.tsx`. Reutilizable tal cual.
- `src/app/client/page.tsx` — única ruta cliente hoy; no tiene `layout.tsx` propio. Puede necesitar uno si se añade navegación adicional (login/demo).
- `src/app/(auth)/login/page.tsx` redirige a `/auth/login/L2Rhc2hib2FyZA%3D%3D` (base64 de `/dashboard`) — ruta legacy `src/app/auth/login/[redirect]/page.tsx`; confirmar en Fase 3 si el nuevo flujo de cliente reutiliza esta ruta o necesita una entrada propia (`/client/login`).

### Arquitectura Propuesta (Feature-First)

```
src/features/client/
├── components/
│   ├── client-portal.tsx        # orquestador (reescrito, delega en subcomponentes)
│   ├── today-workout-panel.tsx
│   ├── habits-panel.tsx
│   ├── checkin-form.tsx
│   ├── coach-chat.tsx
│   └── client-demo-banner.tsx   # aviso "estás en modo demo"
├── services/
│   └── actions.ts               # server actions: getMyPlan, listMyCheckins, sendMyCheckin, listMyMessages, sendMyMessage
└── types/
    └── index.ts

src/features/demo/
├── auth.ts        # + DEMO_CLIENT_SESSION_COOKIE, DEMO_CLIENT_SESSION_VALUE
└── server.ts       # + isDemoClientSession / setDemoClientSession / clearDemoClientSession
```

### Modelo de Datos (nuevas migraciones)

```sql
-- 0007: vincular clientes a cuentas de Supabase Auth
alter table public.clientes
  add column user_id uuid references auth.users(id) on delete set null;

create unique index clientes_user_id_key on public.clientes (user_id) where user_id is not null;

-- El cliente ve/actualiza su propia fila
create policy "Cliente ve su propia ficha"
  on public.clientes for select using (auth.uid() = user_id);

-- Lectura de checkins/mensajes/pagos propios
create policy "Cliente ve sus propios checkins"
  on public.checkins for select using (
    exists (select 1 from public.clientes where clientes.id = checkins.cliente_id and clientes.user_id = auth.uid())
  );
create policy "Cliente crea sus propios checkins"
  on public.checkins for insert with check (
    exists (select 1 from public.clientes where clientes.id = checkins.cliente_id and clientes.user_id = auth.uid())
  );

create policy "Cliente ve sus propios mensajes"
  on public.mensajes for select using (
    exists (select 1 from public.clientes where clientes.id = mensajes.cliente_id and clientes.user_id = auth.uid())
  );
create policy "Cliente envia mensajes propios"
  on public.mensajes for insert with check (
    remitente = 'cliente'
    and exists (select 1 from public.clientes where clientes.id = mensajes.cliente_id and clientes.user_id = auth.uid())
  );

create policy "Cliente ve sus propios pagos"
  on public.pagos for select using (
    exists (select 1 from public.clientes where clientes.id = pagos.cliente_id and clientes.user_id = auth.uid())
  );

-- Vinculación segura email -> user_id (no vía RLS directa, vía RPC security definer)
create or replace function public.claim_client_invite()
returns public.clientes
language plpgsql security definer set search_path = public
as $$
declare
  result public.clientes;
begin
  update public.clientes
  set user_id = auth.uid(), estado = 'Activo'
  where user_id is null
    and lower(email) = lower((select email from auth.users where id = auth.uid()))
  returning * into result;

  if result.id is null then
    raise exception 'No hay invitación pendiente para este email';
  end if;

  return result;
end;
$$;

-- 0008: asignar un programa real a un cliente
alter table public.programas
  add column cliente_id uuid references public.clientes(id) on delete set null;

create index programas_cliente_id_idx on public.programas (cliente_id);

create policy "Cliente ve su programa asignado"
  on public.programas for select using (
    exists (select 1 from public.clientes where clientes.id = programas.cliente_id and clientes.user_id = auth.uid())
  );
-- + políticas de select en cascada para fases_programa / semanas_programa / entrenamientos_programa /
--   bloques_entrenamiento / bloque_ejercicios, mismo patrón EXISTS que ya usan las políticas del entrenador
--   en 0004_periodization_engine.sql, pero terminando en "and clientes.user_id = auth.uid()".
```

---

## Blueprint (Assembly Line)

> Solo fases. Las subtareas se generan al entrar a cada fase con `/bucle-agentico`.

### Fase 1: Modelo de datos — vínculo cliente↔auth y asignación de programa
**Objetivo**: Migraciones `0007` y `0008` aplicadas (columna `clientes.user_id`, RPC `claim_client_invite`, columna `programas.cliente_id`, y RLS de lectura/escritura del lado cliente en `clientes`, `checkins`, `mensajes`, `pagos`, `programas` y toda la cadena de periodización). `src/types/database.ts` actualizado.
**Validación**: `mcp__supabase__list_tables` muestra las columnas nuevas; `mcp__supabase__get_advisors` sin warnings de RLS faltante; `npm run typecheck` pasa con los tipos actualizados.

### Fase 2: Registro y vinculación de cuenta de cliente
**Objetivo**: Un cliente invitado puede crear cuenta (`/client/signup` o equivalente) y queda vinculado a su fila `clientes` vía `claim_client_invite()`. `InviteClientForm`/`createClient` generan un enlace de registro real (no el slug inventado actual).
**Validación**: crear un cliente de prueba desde `/dashboard/clients/new`, completar el registro con ese email, y confirmar en Supabase que `clientes.user_id` quedó poblado.

### Fase 3: Login real con separación de roles
**Objetivo**: `src/actions/auth.ts` y el middleware (`src/lib/supabase/proxy.ts`) distinguen rol tras autenticar (existe `clientes.user_id = auth.uid()` → cliente → `/client`; si no → entrenador → `/dashboard`) y bloquean el cruce de rutas. `signout()` limpia también la cookie demo de cliente.
**Validación**: login con cuenta de cliente real no permite navegar a `/dashboard` (redirect), login de entrenador no permite navegar a `/client` con datos ajenos.

### Fase 4: Sesión demo del portal cliente
**Objetivo**: Nueva cookie/patrón `vq_demo_client_session` (helpers en `features/demo/server.ts` y constantes en `features/demo/auth.ts`, siguiendo exactamente el patrón ya usado para `demo@traintools.es`). Botón "Ver demo" público en la entrada de `/client` que activa esa sesión sin credenciales.
**Validación**: entrar a `/client` sin sesión muestra la opción de demo; tras activarla, el middleware permite `/client` sin `user` real.

### Fase 5: Reconstrucción de `/client` sobre datos reales + demo
**Objetivo**: `src/features/client/services/actions.ts` nuevo, con el mismo patrón `isDemoClientSession() → datos demo` / `real → Supabase filtrado por clientes.user_id` que ya usan `clients`, `checkins` y `messages` en el lado entrenador. `client-portal.tsx` se divide en subcomponentes (límite de 500 líneas) y consume estas acciones en vez de arrays hardcodeados y `localStorage`. En modo demo, las interacciones (marcar ejercicio, enviar check-in, mandar mensaje) mutan solo estado en memoria/cliente, sin llamar a Supabase.
**Validación**: cliente real ve su plan asignado (o mensaje "sin plan asignado" si no hay `programas.cliente_id`), y sus check-ins/mensajes aparecen en `/dashboard/checkins` y `/dashboard/messages`. Modo demo permite el mismo flujo sin crear filas en Supabase (verificar con `mcp__supabase__execute_sql` que no hay filas nuevas tras usar la demo).

### Fase 6: Validación Final
**Objetivo**: Sistema funcionando end-to-end.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] `mcp__supabase__get_advisors` sin alertas de seguridad nuevas
- [ ] Playwright: login de cliente real → `/client` con sus datos; intento de cruce de rol bloqueado; modo demo interactivo sin escritura en BD
- [ ] Criterios de éxito cumplidos

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)

- **Migración 0004 nunca aplicada en producción**: al ejecutar 0008 (que depende de `programas`) saltó `relation "public.programas" does not exist`. Mismo patrón que ya había ocurrido con `0003_pagos.sql` en una sesión anterior — antes de asumir que una migración base existe en Supabase, verificar con `list_tables` (o pedir al usuario que confirme) en vez de asumir por el número de archivo.
- **`/client` debe ser público, no protegido**: el diseño inicial trataba `/client` igual que `/dashboard` (protegido). Pero el criterio de éxito "botón de modo demo sin sesión" exige que la página sea alcanzable sin login — la protección real la da RLS (cada query real filtra por `auth.uid()`), no el middleware. El middleware solo debe bloquear el *cruce* de rol cuando SÍ hay una sesión (real o demo) de un rol distinto.
- **RLS de insert para `checkins`/`mensajes` requiere `entrenador_id` coherente**: no basta con comprobar `clientes.user_id = auth.uid()`; hay que forzar `clientes.entrenador_id = checkins.entrenador_id` en el mismo `with check`, si no un cliente podría insertar filas con un `entrenador_id` arbitrario y el check-in nunca aparecería en el panel del entrenador correcto.
- **`repeticiones` es texto libre en el motor de periodización**: no se puede asumir que sea un entero parseable para calcular el timer. Se resolvió con un `match(/\d+/)` y fallback a 10 reps si no hay número.

---

## Gotchas

- [ ] El trigger `handle_new_user` (migración `0001_profiles.sql`) crea una fila en `profiles` para **cualquier** signup, incluidos los futuros clientes. El rol nunca debe inferirse por "tiene fila en `profiles`" — debe inferirse por `clientes.user_id = auth.uid()`.
- [ ] Hoy el middleware (`src/lib/supabase/proxy.ts`) deja entrar a `/dashboard` y `/client` a cualquier usuario autenticado indistintamente: es un hueco de seguridad real que esta PRP debe cerrar, no solo una mejora de UX.
- [ ] La vinculación email → `clientes.user_id` NO debe hacerse con una política RLS de `update` abierta (permitiría a cualquier usuario autenticado "robar" una fila de cliente cambiando su propio `user_id`); debe pasar por la función `security definer` `claim_client_invite()`.
- [ ] `client-portal.tsx` ya supera las 500 líneas permitidas por las reglas de código del proyecto; la reconstrucción debe dividirlo en subcomponentes, no seguir creciendo el archivo.
- [ ] El enlace de invitación actual (`/client/invite/{slug}`) no corresponde a ninguna ruta real — no reutilizar ese slug, sustituirlo por un flujo de registro real basado en email.

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan (reutilizar el patrón `isDemoSession()` / fallback a demo ya usado en `clients`, `checkins`, `messages`)
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes, como ya hace `features/demo/auth.ts`)
- NO omitir validación Zod en inputs de usuario (seguir el patrón de `features/messages/services/actions.ts` y `features/checkins/services/actions.ts`)
- NO abrir políticas RLS de `update`/`insert` más permisivas de lo necesario para resolver la vinculación de cuenta

---

*PRP pendiente aprobación. No se ha modificado código.*
