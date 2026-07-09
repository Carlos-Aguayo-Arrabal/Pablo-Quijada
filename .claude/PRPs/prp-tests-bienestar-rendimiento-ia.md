# PRP-008: Tests de bienestar y rendimiento + resumen de IA del atleta

> **Estado**: IMPLEMENTADO (pendiente deploy + OPENROUTER_API_KEY en Easypanel)
> **Fecha**: 2026-07-09
> **Proyecto**: TrainTools

---

## Objetivo

Dar al entrenador dos nuevas fuentes de datos estructuradas sobre cada cliente — un cuestionario de bienestar autoinformado (sueño, estrés, dolor, energía) que el cliente rellena periódicamente desde `/client`, y un registro de tests físicos/de rendimiento (marcas, medidas, fuerza, tiempos) que el entrenador captura desde el dashboard — y sintetizar ambas fuentes junto con los check-ins y mensajes recientes en un resumen del estado general del atleta generado por IA, visible en la ficha del cliente (`/dashboard/clients/[id]`).

## Por Qué

| Problema | Solución |
|----------|----------|
| El check-in rápido actual (`checkins`: peso, energía, comentario libre) no captura bienestar estructurado (sueño, estrés, dolor) ni progreso físico objetivo (fuerza, resistencia, medidas) | Cuestionario de bienestar estructurado (nueva tabla) + registro de tests físicos capturado por el entrenador (nueva tabla) |
| El entrenador debe leer manualmente check-ins, cuestionarios, tests y mensajes para evaluar el estado de cada cliente — no escala con muchos clientes | Resumen generado por IA (OpenRouter) que sintetiza todas las fuentes en un párrafo accionable, cacheado y visible directamente en la ficha del cliente |
| El tab "Progreso" de la ficha del cliente es 100% mock hoy (`progressData` hardcodeado en `client-profile-tabs.tsx`) — ya identificado como deuda pendiente en PRP-002 | Se reemplaza por datos reales derivados de `tests_fisicos` y `cuestionarios_bienestar` |

**Valor de negocio**: reduce el tiempo que el entrenador dedica a revisar manualmente cada cliente (menos scroll por check-ins/mensajes/notas), permite detectar riesgo temprano (dolor, estrés alto, bajo rendimiento) antes de que derive en abandono, y añade una feature de IA visible que diferencia el producto.

## Qué

### Criterios de Éxito
- [ ] El cliente puede rellenar un cuestionario de bienestar (sueño, estrés, dolor, energía) desde `/client`, como flujo separado del check-in rápido existente
- [ ] El entrenador puede registrar tests físicos/de rendimiento (categoría, nombre, valor, unidad, fecha) desde la ficha del cliente en el dashboard
- [ ] El tab "Progreso" de `/dashboard/clients/[id]` muestra datos reales de tests y cuestionarios de bienestar en vez del mock actual
- [ ] El entrenador puede generar (bajo demanda) un resumen de IA del estado general del atleta, basado en check-ins + cuestionarios de bienestar + tests + mensajes recientes, visible en la ficha del cliente
- [ ] El resumen de IA queda cacheado (no se regenera en cada render) y el entrenador puede forzar una regeneración
- [ ] Todo el acceso a datos respeta RLS: el cliente solo ve/edita lo suyo, el entrenador solo ve lo de sus propios clientes

### Comportamiento Esperado (Happy Path)

**Cliente**: entra a `/client`, ve (además del check-in rápido existente) un cuestionario de bienestar con sliders/inputs para sueño, estrés, dolor y energía (1-10) más un campo opcional de notas. Lo envía. El entrenador lo ve reflejado en el historial de ese cliente.

**Entrenador**: entra a `/dashboard/clients/[id]`, en el tab "Progreso" ve un botón para "Registrar test". Abre un formulario, elige categoría (fuerza, resistencia, flexibilidad, medidas, otro), nombre del test (ej. "1RM Sentadilla", "5km"), valor, unidad y fecha. Al guardar, aparece en la lista de tests del cliente, ordenado por fecha.

**Resumen de IA**: en el tab "Resumen" de la ficha del cliente, el entrenador ve un botón "Generar resumen con IA". Al pulsarlo, el sistema toma los últimos check-ins, cuestionarios de bienestar, tests y mensajes del cliente, llama a OpenRouter (structured output) y muestra un resumen con estado general (óptimo/estable/atención/riesgo), 2-4 puntos clave y una recomendación. El resultado se guarda; en visitas siguientes se muestra el último resumen cacheado con su fecha, con opción de regenerar.

---

## Contexto

### Referencias (código existente a seguir como patrón)

- `src/features/checkins/` — patrón completo de feature "periódica cliente → entrenador": `services/actions.ts` (`listCheckIns`, `getCheckInStats`), `components/checkins-board.tsx`, `data.ts` (tipos + helpers de tono/color)
- `src/features/client/components/checkin-form.tsx` + `src/features/client/services/actions.ts` (`submitMyCheckin`) — patrón de formulario `'use client'` en `/client` que llama a una server action con Zod, resuelve `clientes.id`/`entrenador_id` vía `clientes.user_id = auth.uid()`, y hace `revalidatePath('/client')`
- `src/features/client/components/client-portal-view.tsx` — orquestador de `/client`; el nuevo formulario de bienestar se monta aquí junto a `CheckinForm`
- `src/app/(main)/dashboard/clients/[id]/page.tsx` + `src/features/clients/components/client-profile-tabs.tsx` — ficha del cliente; el tab "Progreso" (línea ~172, array `progressData` hardcodeado) es el punto de reemplazo por datos reales; el tab "Resumen" (línea ~81) es donde vive la card de resumen IA
- `src/features/payments/` — único feature del client-profile-tabs que ya usa datos reales pasados como props desde el Server Component (`listPaymentsByClient`); seguir ese mismo patrón para tests y bienestar
- `.claude/skills/ai/references/agents/00-setup-base.md` y `single-call.md` / `structured-outputs.md` — patrón de instalación de OpenRouter + Vercel AI SDK v5 en este proyecto. **Importante**: no hay precedente en el repo todavía — `src/lib/ai/` no existe, no hay `OPENROUTER_API_KEY`, no hay dependencias `ai`/`@ai-sdk/*`/`@openrouter/ai-sdk-provider` instaladas. Fase 0 de este PRP cubre ese setup
- `supabase/migrations/0002_coach_core_data.sql` y `0007_client_accounts.sql` — convención de RLS dual `entrenador_id` (columna plana, `auth.uid() = entrenador_id`) + `cliente_id` (vía `EXISTS (select 1 from clientes where clientes.id = X.cliente_id and clientes.user_id = auth.uid())`), y verificación cruzada `clientes.entrenador_id = X.entrenador_id` en policies de INSERT del lado cliente
- `src/types/database.ts` — tipos `Database` mantenidos a mano (sin codegen); añadir bloques para las tablas nuevas

### Arquitectura Propuesta (Feature-First)

```
src/lib/ai/
├── openrouter.ts          # cliente OpenRouter + MODELS map (Fase 0, patrón skill ai)
└── generate.ts            # wrapper generateObject/generateText (Fase 0)

src/features/wellness/                    # cuestionario de bienestar (cliente)
├── components/
│   └── wellness-form.tsx                 # 'use client', montado en client-portal-view.tsx
├── services/
│   └── actions.ts                        # submitWellnessCheck (cliente), listWellnessHistory(clienteId) (entrenador)
└── data.ts                               # tipos + helpers (tono por nivel de estrés/dolor)

src/features/performance-tests/           # tests físicos/rendimiento (entrenador)
├── components/
│   ├── test-form.tsx                     # alta de test, dentro del tab Progreso
│   └── tests-list.tsx                    # listado, reemplaza progressData mock
├── services/
│   └── actions.ts                        # createPerformanceTest, listPerformanceTests(clienteId), deletePerformanceTest
└── data.ts                               # tipos (categorías, unidades) + helpers

src/features/ai-summary/                  # resumen de IA del atleta
├── components/
│   └── ai-summary-card.tsx               # tab Resumen de la ficha del cliente
├── services/
│   └── actions.ts                        # generateClientSummary(clienteId), getLatestSummary(clienteId)
└── data.ts                               # tipos (estadoGeneral, puntosClave, etc.)
```

Cambios en features existentes:
- `src/features/clients/components/client-profile-tabs.tsx` — tab "Progreso" pasa a recibir `tests` y `wellnessHistory` como props reales (en vez de `progressData` mock); tab "Resumen" monta `<AiSummaryCard />`
- `src/app/(main)/dashboard/clients/[id]/page.tsx` — añade `listPerformanceTests(id)`, `listWellnessHistory(id)` y `getLatestSummary(id)` al `Promise.all` existente
- `src/features/client/components/client-portal-view.tsx` — añade `<WellnessForm />` junto a `<CheckinForm />`
- `src/types/database.ts` — nuevas entradas `cuestionarios_bienestar`, `tests_fisicos`, `resumenes_ia`

### Modelo de Datos

```sql
-- Cuestionario de bienestar autoinformado por el cliente (distinto del check-in rápido)
CREATE TABLE cuestionarios_bienestar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrenador_id UUID NOT NULL REFERENCES profiles(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  sueno INT NOT NULL CHECK (sueno BETWEEN 1 AND 10),
  estres INT NOT NULL CHECK (estres BETWEEN 1 AND 10),
  dolor INT NOT NULL CHECK (dolor BETWEEN 1 AND 10),
  energia INT NOT NULL CHECK (energia BETWEEN 1 AND 10),
  notas TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cuestionarios_bienestar ENABLE ROW LEVEL SECURITY;

-- Entrenador: acceso total a los cuestionarios de sus clientes (columna plana, igual que checkins)
CREATE POLICY "entrenador_select_bienestar" ON cuestionarios_bienestar
  FOR SELECT USING (auth.uid() = entrenador_id);

-- Cliente: solo puede ver e insertar sus propios cuestionarios
CREATE POLICY "cliente_select_bienestar" ON cuestionarios_bienestar
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clientes WHERE clientes.id = cuestionarios_bienestar.cliente_id AND clientes.user_id = auth.uid())
  );

CREATE POLICY "cliente_insert_bienestar" ON cuestionarios_bienestar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = cuestionarios_bienestar.cliente_id
        AND clientes.user_id = auth.uid()
        AND clientes.entrenador_id = cuestionarios_bienestar.entrenador_id
    )
  );

-- Tests físicos / de rendimiento, registrados por el entrenador
CREATE TABLE tests_fisicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrenador_id UUID NOT NULL REFERENCES profiles(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  categoria TEXT NOT NULL CHECK (categoria IN ('fuerza', 'resistencia', 'flexibilidad', 'medidas', 'otro')),
  nombre TEXT NOT NULL,           -- ej. "1RM Sentadilla", "5km", "Sit-and-reach"
  valor NUMERIC NOT NULL,
  unidad TEXT NOT NULL,           -- kg, seg, cm, reps, etc.
  fecha_test DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tests_fisicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entrenador_crud_tests" ON tests_fisicos
  FOR ALL USING (auth.uid() = entrenador_id) WITH CHECK (auth.uid() = entrenador_id);

-- Cliente: solo lectura de sus propios tests
CREATE POLICY "cliente_select_tests" ON tests_fisicos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clientes WHERE clientes.id = tests_fisicos.cliente_id AND clientes.user_id = auth.uid())
  );

-- Resumen del estado del atleta generado por IA (cacheado, historial)
CREATE TABLE resumenes_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrenador_id UUID NOT NULL REFERENCES profiles(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  estado_general TEXT NOT NULL CHECK (estado_general IN ('optimo', 'estable', 'atencion', 'riesgo')),
  resumen TEXT NOT NULL,
  puntos_clave TEXT[] NOT NULL DEFAULT '{}',
  recomendacion TEXT NOT NULL,
  modelo TEXT NOT NULL,
  generado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE resumenes_ia ENABLE ROW LEVEL SECURITY;

-- Solo el entrenador accede al resumen (feature interna suya, no visible para el cliente)
CREATE POLICY "entrenador_crud_resumenes" ON resumenes_ia
  FOR ALL USING (auth.uid() = entrenador_id) WITH CHECK (auth.uid() = entrenador_id);
```

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 0: Setup base de IA
**Objetivo**: Infraestructura de OpenRouter/Vercel AI SDK lista en el proyecto (no existe todavía): dependencias instaladas, `OPENROUTER_API_KEY` documentada, `src/lib/ai/openrouter.ts` con el cliente y el `MODELS` map, siguiendo `.claude/skills/ai/references/agents/00-setup-base.md`.
**Validación**: `npm run typecheck` pasa, el cliente se puede importar desde una server action de prueba sin error de env var faltante.

### Fase 1: Modelo de datos
**Objetivo**: Migraciones para `cuestionarios_bienestar`, `tests_fisicos` y `resumenes_ia` con RLS siguiendo el patrón dual `entrenador_id`/`cliente_id` existente (ver sección Modelo de Datos); `src/types/database.ts` actualizado con los nuevos bloques `Row`/`Insert`/`Update`.
**Validación**: migraciones aplican sin error (`apply_migration`), RLS habilitado en las 3 tablas y sin advertencias críticas en `get_advisors`, tipos exportados sin error de compilación.

### Fase 2: Cuestionario de bienestar (cliente)
**Objetivo**: Cliente puede rellenar el cuestionario de bienestar (sueño, estrés, dolor, energía + notas) desde `/client`, como flujo independiente del check-in rápido; entrenador puede consultar el historial de un cliente.
**Validación**: formulario funcional en `/client` (modo demo y modo real), `submitWellnessCheck` inserta correctamente respetando RLS, `listWellnessHistory` devuelve datos filtrados por cliente para el entrenador.

### Fase 3: Tests físicos/de rendimiento (entrenador) + tab Progreso real
**Objetivo**: Entrenador puede registrar tests físicos desde la ficha del cliente (`/dashboard/clients/[id]`); el tab "Progreso" de `client-profile-tabs.tsx` muestra datos reales (tests + cuestionarios de bienestar) en lugar del array mock `progressData`.
**Validación**: alta de test funcional con validación Zod por categoría/unidad, listado ordenado por fecha, tab Progreso renderiza datos reales del cliente correcto, `npm run typecheck` pasa.

### Fase 4: Resumen de IA del atleta
**Objetivo**: Botón "Generar resumen" en el tab "Resumen" de la ficha del cliente; `generateClientSummary` recopila check-ins + cuestionarios de bienestar + tests + mensajes recientes del cliente, llama a OpenRouter con `generateObject` (schema Zod: `estadoGeneral`, `resumen`, `puntosClave`, `recomendacion`) y guarda el resultado en `resumenes_ia`; la UI muestra el último resumen cacheado con fecha y permite regenerar.
**Validación**: genera un resumen coherente con datos reales de un cliente demo, se persiste en `resumenes_ia`, la UI degrada con mensaje de error claro si la llamada a IA falla (sin romper el resto de la página).

### Fase 5: Validación Final
**Objetivo**: Sistema funcionando end-to-end.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot de `/client` (cuestionario de bienestar visible) y `/dashboard/clients/[id]` (tab Progreso con datos reales + tab Resumen con card de IA)
- [ ] Criterios de éxito cumplidos

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

### 2026-07-09: Anthropic (vía OpenRouter, structured output estricto) rechaza minItems/maxItems en arrays
- **Error**: `generateObject` con un schema Zod `z.array(z.string()).min(2).max(4)` falla con `output_config.format.schema: For 'array' type, 'minItems' values other than 0 or 1 are not supported`. Quitar solo `.min()` no basta: `maxItems` también da error (`property 'maxItems' is not supported`).
- **Fix**: no poner restricciones de longitud en arrays del schema Zod usado con `generateObject` sobre modelos Anthropic vía OpenRouter. Pedir el rango deseado (ej. "entre 2 y 4 puntos clave") en el texto del prompt, y usar `.describe()` en el campo para reforzarlo.
- **Aplicar en**: cualquier `generateObject`/`generateText` con schema estructurado que use un modelo `anthropic/*` en este proyecto (o futuros) — revisar arrays con `.min()`/`.max()`/`.length()` antes de asumir que el schema se valida en el proveedor.

### 2026-07-09: Cuenta de OpenRouter con crédito bajo — limitar maxOutputTokens
- **Error**: sin `maxOutputTokens` explícito, el SDK pide hasta 65536 tokens por defecto, y OpenRouter rechaza la llamada con `This request requires more credits... you can only afford 4000`.
- **Fix**: pasar siempre `maxOutputTokens` explícito y razonable (1000 para el resumen de IA) en cualquier llamada `generateText`/`generateObject`.
- **Aplicar en**: cualquier llamada nueva a OpenRouter en este proyecto.

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] Este repo NO tiene todavía la infraestructura de IA instalada (sin `src/lib/ai/`, sin `OPENROUTER_API_KEY`, sin dependencias `ai`/`@ai-sdk/*`/`@openrouter/ai-sdk-provider`) — la Fase 0 es obligatoria antes de tocar la Fase 4, no asumir que ya existe
- [ ] Seguir el patrón denormalizado `entrenador_id` + `cliente_id` en ambas tablas nuevas (no solo relación vía `clientes`) para que las políticas RLS sean planas, igual que `checkins` y `mensajes`
- [ ] Las políticas de INSERT del lado cliente deben verificar también que `clientes.entrenador_id` coincide con el `entrenador_id` insertado, para evitar que un cliente falsifique el entrenador (mismo bug de seguridad prevenido en `0007_client_accounts.sql`)
- [ ] Traducir también los VALORES de los enums al español, no solo los nombres de columnas — bug real documentado en PRP-002 (check constraint en español, código insertando string en inglés)
- [ ] El tab "Progreso" de `client-profile-tabs.tsx` es 100% mock hoy (`progressData` hardcodeado, línea ~38) — reemplazar por datos reales en Fase 3, no añadir un tab nuevo
- [ ] `/client` debe seguir siendo público (protegido solo por RLS, no por middleware) para que el modo demo funcione — el nuevo formulario de bienestar debe respetar ese mismo principio (no forzar auth)
- [ ] Seguir el patrón `isDemoSession()` / `isDemoClientSession()` → query real → fallback demo en todas las nuevas server actions, igual que `features/checkins/services/actions.ts` y `features/client/services/actions.ts`
- [ ] No confundir `cuestionarios_bienestar` con la tabla `checkins` existente — son conceptualmente distintos (checkins ya tiene su propio flujo de aprobación/riesgo) y no deben fusionarse

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validación Zod en inputs de usuario
- NO generar el resumen de IA en cada render de la página — cachear en `resumenes_ia` y regenerar solo bajo demanda explícita del entrenador
- NO mezclar el cuestionario de bienestar con la tabla `checkins` existente

---

*PRP pendiente aprobación. No se ha modificado código.*
