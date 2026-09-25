-- =====================================================================
-- Vencimiento de puntos por inactividad — septiembre 2026
-- =====================================================================
--
-- Cada negocio puede elegir que los puntos venzan si el cliente pasa N
-- meses sin comprar ni canjear. Por defecto está apagado (null) y los
-- puntos no vencen, igual que siempre.
--
-- Dos reglas para que nadie pierda puntos de golpe:
--   1. El plazo se cuenta desde el día que el negocio lo activa: un
--      cliente que no viene hace un año no pierde nada al día siguiente.
--   2. Si el negocio acorta el plazo (6 → 3 meses), la cuenta vuelve a
--      arrancar ese día. Si lo alarga, se mantiene la fecha original.
-- Las dos las hace cumplir el trigger de abajo y no el dashboard: el dueño
-- actualiza su negocio directo contra la base (RLS), así que lo que mande
-- en `vencimiento_desde` no vale.
--
-- "Actividad" = la última compra (ultima_visita), el último canje o el
-- alta del cliente, lo más reciente. Los puntos de cumpleaños y de
-- referido no cuentan: no son algo que el cliente hizo en el negocio.
--
-- ultima_visita y created_at son `timestamp` sin zona guardados en UTC;
-- por eso el `at time zone 'UTC'`.
--
-- Aplicar ANTES de deployar el código: la tarjeta pide la columna
-- vencimiento_meses y sin ella la consulta falla.
-- =====================================================================

set client_encoding = 'UTF8';

begin;

-- ---------------------------------------------------------------------
-- 1. Configuración por negocio
-- ---------------------------------------------------------------------

alter table public.negocios
  add column if not exists vencimiento_meses int,
  add column if not exists vencimiento_desde timestamptz;

alter table public.negocios drop constraint if exists negocios_vencimiento_meses_check;
alter table public.negocios
  add constraint negocios_vencimiento_meses_check
  check (vencimiento_meses is null or vencimiento_meses between 1 and 36);

create or replace function public.fn_negocio_vencimiento_desde()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.vencimiento_meses is null then
    new.vencimiento_desde := null;
  elsif tg_op = 'INSERT'
     or old.vencimiento_meses is null
     or new.vencimiento_meses < old.vencimiento_meses then
    new.vencimiento_desde := now();
  else
    new.vencimiento_desde := old.vencimiento_desde;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_negocio_vencimiento_desde on public.negocios;
create trigger trg_negocio_vencimiento_desde
  before insert or update of vencimiento_meses, vencimiento_desde on public.negocios
  for each row execute function public.fn_negocio_vencimiento_desde();

-- ---------------------------------------------------------------------
-- 2. Cuándo vencen los puntos de un cliente
--    null si su negocio no tiene el vencimiento activado.
-- ---------------------------------------------------------------------

create or replace function public.fn_puntos_vencen_at(p_cliente_id uuid)
returns timestamptz
language sql stable security definer
set search_path = public
as $$
  select greatest(
           c.created_at    at time zone 'UTC',
           c.ultima_visita at time zone 'UTC',
           (select max(k.created_at) from canjes k where k.cliente_id = c.id) at time zone 'UTC',
           n.vencimiento_desde
         ) + make_interval(months => n.vencimiento_meses)
  from clientes c
  join negocios n on n.id = c.negocio_id
  where c.id = p_cliente_id
    and n.vencimiento_meses is not null;
$$;

-- ---------------------------------------------------------------------
-- 3. Vencer los puntos
--    Deja el saldo en 0 y lo anota en el historial. Con p_cliente_id
--    revisa solo ese cliente (lo usa la tarjeta al abrirse); sin él,
--    todos (cron diario). Devuelve los clientes afectados para
--    actualizar su pase de Wallet.
--
--    `skip locked`: si en ese momento se está acreditando una compra a
--    ese cliente, se lo saltea — la compra es actividad, y si igual
--    correspondía vencer, lo agarra la próxima corrida.
-- ---------------------------------------------------------------------

create or replace function public.fn_vencer_puntos(p_cliente_id uuid default null)
returns setof uuid
language plpgsql security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select c.id, c.negocio_id, c.puntos, n.vencimiento_meses
    from clientes c
    join negocios n on n.id = c.negocio_id
    where n.vencimiento_meses is not null
      and c.puntos > 0
      and (p_cliente_id is null or c.id = p_cliente_id)
      and fn_puntos_vencen_at(c.id) <= now()
    for update of c skip locked
  loop
    update clientes set puntos = 0 where id = r.id;

    insert into transacciones (cliente_id, negocio_id, tipo, puntos, descripcion)
    values (r.id, r.negocio_id, 'vencimiento', r.puntos,
            'Puntos vencidos: ' || r.vencimiento_meses || ' meses sin compras ni canjes');

    return next r.id;
  end loop;
end;
$$;

-- Solo para el servidor (service role), como las demás funciones:
revoke execute on function public.fn_puntos_vencen_at(uuid) from public, anon, authenticated;
revoke execute on function public.fn_vencer_puntos(uuid) from public, anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- Verificación: ningún negocio tiene que quedar con el vencimiento
-- activado (arranca apagado para todos) y las funciones tienen que existir.
-- ---------------------------------------------------------------------

select
  (select count(*) from negocios where vencimiento_meses is not null) as negocios_con_vencimiento,
  (select count(*) from pg_proc where proname in ('fn_puntos_vencen_at', 'fn_vencer_puntos', 'fn_negocio_vencimiento_desde')) as funciones;
