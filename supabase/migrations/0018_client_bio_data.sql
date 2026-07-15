-- Datos biométricos y nivel del cliente, para la ficha "Editar datos" (inspirado en
-- DT Coach). Objetivo, peso y notas ya existían (objetivo/peso/notas) y se reutilizan
-- como "Objetivos"/"Peso"/"Observaciones" — solo faltan nivel, edad, FC máxima, altura
-- y lesiones/patologías (distinto de `riesgos`, que es riesgo de negocio/retención,
-- no médico).

alter table public.clientes
  add column if not exists nivel text check (nivel in ('Iniciado', 'Intermedio', 'Avanzado')),
  add column if not exists edad integer,
  add column if not exists fc_maxima integer,
  add column if not exists altura integer,
  add column if not exists lesiones text;
