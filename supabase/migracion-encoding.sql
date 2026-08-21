-- =====================================================================
-- Reparación de codificación — agosto 2026
-- =====================================================================
--
-- Síntoma: en el panel salía "DevoluciÃ³n: cÃ³digo de canje vencido".
--
-- Causa: los textos de fn_expirar_canje y fn_acreditar_cumpleanos quedaron
-- doble-codificados en producción. El archivo del repo (migracion-seguridad.sql)
-- siempre estuvo bien; se aplicó con un cliente que leyó los bytes UTF-8 como
-- Latin-1, así que "ó" (C3 B3) se guardó como "Ã³" (C3 83 C2 B3). Cada
-- devolución y cada cumpleaños siguieron insertando el texto roto.
--
-- Aparte, los nombres de clientes que se registraban con Google entraban
-- rotos por el mismo motivo (atob en app/registro/[slug]/page.js). Eso ya
-- está arreglado en el código; acá se reparan los que quedaron guardados.
--
-- Este script:
--   1. recrea las dos funciones con el texto correcto. Se comparó cada una
--      contra pg_get_functiondef en producción: son idénticas al repo salvo
--      el literal, así que no se pisa ningún cambio hecho a mano.
--   2. repara las filas históricas de transacciones (9 filas)
--   3. repara los nombres de clientes (4 filas)
--
-- IMPORTANTE — aplicarlo con la codificación correcta o se vuelve a romper.
-- Lo más seguro es pegarlo en el SQL editor de Supabase. Si se usa psql en
-- Windows, el `set client_encoding` de abajo es justamente lo que evita
-- repetir el bug original.
-- =====================================================================

set client_encoding = 'UTF8';

begin;

-- ---------------------------------------------------------------------
-- 1. Las dos funciones, con el texto correcto
-- ---------------------------------------------------------------------

create or replace function public.fn_expirar_canje(p_canje_id uuid)
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  v_canje canjes%rowtype;
begin
  update canjes set estado = 'expirado'
  where id = p_canje_id and estado = 'pendiente'
  returning * into v_canje;

  if not found then
    return false;
  end if;

  update clientes set puntos = puntos + v_canje.puntos_descontados
  where id = v_canje.cliente_id;

  insert into transacciones (cliente_id, negocio_id, tipo, puntos, descripcion)
  values (v_canje.cliente_id, v_canje.negocio_id, 'devolucion', v_canje.puntos_descontados, 'Devolución: código de canje vencido');

  return true;
end;
$$;

create or replace function public.fn_acreditar_cumpleanos()
returns int
language plpgsql security definer
set search_path = public
as $$
declare
  v_total int := 0;
  r record;
begin
  for r in
    select c.id, c.negocio_id, n.puntos_cumpleanos
    from clientes c
    join negocios n on n.id = c.negocio_id
    where c.fecha_nacimiento is not null
      and coalesce(n.puntos_cumpleanos, 0) > 0
      and to_char(c.fecha_nacimiento, 'MM-DD') =
          to_char((now() at time zone 'America/Argentina/Buenos_Aires')::date, 'MM-DD')
      and not exists (
        select 1 from transacciones t
        where t.cliente_id = c.id
          and t.tipo = 'cumpleanos'
          and t.created_at > now() - interval '11 months'
      )
  loop
    update clientes
    set puntos            = puntos + r.puntos_cumpleanos,
        puntos_historicos = coalesce(puntos_historicos, 0) + r.puntos_cumpleanos
    where id = r.id;

    insert into transacciones (cliente_id, negocio_id, tipo, puntos, descripcion)
    values (r.id, r.negocio_id, 'cumpleanos', r.puntos_cumpleanos, '¡Feliz cumpleaños! Puntos de regalo');

    v_total := v_total + 1;
  end loop;

  return v_total;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Filas históricas totalmente rotas
--
-- Deshace la doble codificación: pasa el texto a bytes Latin-1 (que
-- recupera los bytes UTF-8 originales) y los relee como UTF-8.
--
-- El segundo guard (`!~ '[áéíóúñüÁÉÍÓÚÑ]'`) es imprescindible: si una fila
-- mezcla acentos correctos con acentos rotos, convert_to a LATIN1 arruina
-- los correctos. Esas filas se tratan aparte en el paso 3.
-- ---------------------------------------------------------------------

update transacciones
set descripcion = convert_from(convert_to(descripcion, 'LATIN1'), 'UTF8')
where descripcion ~ '[ÃÂ]'
  and descripcion !~ '[áéíóúñüÁÉÍÓÚÑ]';

-- ---------------------------------------------------------------------
-- 3. Filas mixtas
--
-- "Referido exitoso: joaquÃ­n Mendez se registró con tu link": el nombre
-- vino roto del navegador, pero el texto de alrededor lo escribió Node y
-- está bien. Solo se reemplaza la secuencia rota.
--
-- chr(173) es el soft hyphen (U+00AD), el segundo carácter de "Ã­". Se
-- escribe así a propósito: en el archivo sería invisible.
-- ---------------------------------------------------------------------

update transacciones
set descripcion = replace(descripcion, 'Ã' || chr(173), 'í')
where descripcion ~ '[ÃÂ]'
  and descripcion ~ '[áéíóúñüÁÉÍÓÚÑ]';

-- ---------------------------------------------------------------------
-- 4. Nombres de clientes rotos por el registro con Google
-- ---------------------------------------------------------------------

update clientes
set nombre = convert_from(convert_to(nombre, 'LATIN1'), 'UTF8')
where nombre ~ '[ÃÂ]'
  and nombre !~ '[áéíóúñüÁÉÍÓÚÑ]';

commit;

-- ---------------------------------------------------------------------
-- Verificación: las tres consultas tienen que devolver 0 filas.
-- ---------------------------------------------------------------------

select 'transacciones rotas' as chequeo, count(*) as filas
from transacciones where descripcion ~ '[ÃÂ]'
union all
select 'clientes rotos', count(*)
from clientes where nombre ~ '[ÃÂ]'
union all
select 'funciones rotas', count(*)
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosrc like '%Ã%';
