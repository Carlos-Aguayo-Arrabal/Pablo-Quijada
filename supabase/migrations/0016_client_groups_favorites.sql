-- Soporte para "Grupos" y "Favoritos" en el menú (inspirado en DT Coach): agrupar
-- clientes por texto libre (cohortes, horarios, niveles...) y marcar clientes destacados
-- para acceso rápido. Se mantiene el patrón simple de columnas directas en `clientes`
-- (como ya existe `etiquetas`) en vez de tablas relacionales nuevas, ya que no hay hoy
-- ningún requisito de gestionar grupos como entidad propia (crear/renombrar/borrar un
-- grupo fuera del texto libre por cliente) — YAGNI.

alter table public.clientes
  add column if not exists grupo text,
  add column if not exists favorito boolean not null default false;
