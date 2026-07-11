-- ultima_conexion se lee para mostrar "Último acceso" en la ficha de cliente, pero nada la
-- escribía nunca: la única RLS UPDATE de `clientes` es "auth.uid() = entrenador_id", así que
-- el propio cliente no puede tocar su fila. Se usa una función security definer (mismo patrón
-- que claim_client_invite) para que el cliente solo pueda actualizar esa columna concreta de
-- su propia fila, sin abrir UPDATE general vía RLS.

create or replace function public.touch_client_last_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clientes
  set ultima_conexion = now()
  where user_id = auth.uid();
end;
$$;

grant execute on function public.touch_client_last_seen() to authenticated;
