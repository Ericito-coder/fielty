-- =====================================================================
-- Pruebas de migracion-proteger-plan.sql (NO es una migracion)
-- =====================================================================
--
-- Correr en el SQL editor DESPUES de aplicar la migracion. No deja
-- cambios: cada prueba corre en una subtransaccion que se deshace
-- siempre, y el plan del negocio de prueba se restaura al final. Todo va
-- dentro de una transaccion, asi que nadie de afuera llega a ver el
-- cambio temporal de plan.
--
-- probar() hace lo mismo que PostgREST en cada request: cambia el rol de
-- la conexion (authenticated / service_role) y carga los claims del JWT.
-- Asi se prueba RLS + triggers tal cual los ve el navegador, sin
-- contrasenias ni sesiones.
--
-- Usa el negocio con slug 'demo' (fielty-dev). En prod, cambiar 'demo'
-- por 'negocio-test-eric' en la tabla _ctx.
--
-- Resultado esperado: la columna "resultado" coincide con "esperado" en
-- todas las filas, y plan_final es el plan que tenia el negocio antes.
-- =====================================================================

create or replace function pg_temp.probar(p_rol text, p_claims jsonb, p_sql text)
returns text language plpgsql as $f$
declare v text;
begin
  begin
    perform set_config('request.jwt.claims', coalesce(p_claims::text, ''), true);
    if p_rol is not null then perform set_config('role', p_rol, true); end if;
    execute p_sql into v;
    raise exception using errcode = 'P0999', message = 'OK: ' || coalesce(v, '(sin filas)');
  exception when others then
    if sqlstate = 'P0999' then return sqlerrm; end if;
    return 'ERROR ' || sqlstate || ': ' || sqlerrm;
  end;
end $f$;

drop table if exists _ctx;
drop table if exists _res;
create temp table _res (n int, prueba text, esperado text, resultado text);

begin;

create temp table _ctx as
  select id as neg, user_id as uid, plan as plan_orig, plan_manual as manual_orig,
         jsonb_build_object('sub', user_id, 'role', 'authenticated') as c_auth,
         '{"role":"service_role"}'::jsonb as c_srv,
         (select count(*) from sucursales s where s.negocio_id = n.id) as sucursales_antes
  from negocios n where slug = 'demo';

-- Arranca como un negocio gratis (se restaura al final)
update negocios set plan = 'gratis', plan_manual = false where id = (select neg from _ctx);

insert into _res
select 1, 'duenio: plan -> business', 'ERROR 42501',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set plan = 'business' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 2, 'duenio: plan_manual -> true', 'ERROR 42501',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set plan_manual = true where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 3, 'duenio: plan_expira_at -> +1 anio', 'ERROR 42501',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set plan_expira_at = now() + interval '1 year' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 4, 'duenio: mp_plan_id / mp_plan_tipo', 'ERROR 42501',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set mp_plan_id = 'x', mp_plan_tipo = 'business' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 5, 'duenio: guardar Config del dashboard', 'OK 1 fila',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set color = '#123456', telefono = '1155555555', pesos_por_punto = 200, puntos_por_tramo = 2, puntos_bienvenida = 0, puntos_cumpleanos = 30, puntos_referido_emisor = 80, puntos_referido_receptor = 40, pin_caja = 'nuevo-pin-1' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 6, 'duenio: subir logo (logo_url)', 'OK 1 fila',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set logo_url = 'https://x/logo.png?v=1' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 7, 'duenio: tipo (columna cualquiera no protegida)', 'OK 1 fila',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set tipo = 'puntos' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 8, 'duenio: reenvio del onboarding (update con payload completo)', 'OK 1 fila',
  pg_temp.probar('authenticated', c_auth, replace(replace($q$with u as (update negocios set telefono = '', color = '#e0001b', tipo = 'puntos', pesos_por_punto = 100, puntos_por_tramo = 1, puntos_bienvenida = 10, puntos_cumpleanos = 50, puntos_referido_emisor = 100, puntos_referido_receptor = 50, pin_caja = 'pin-prueba-1', user_id = ':uid' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text), ':uid', uid::text)) from _ctx
union all
select 9, 'duenio: manda plan igual al que ya tiene', 'OK 1 fila',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set plan = 'gratis', tipo = 'puntos' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 10, 'duenio: crea negocio con plan business (insert)', 'OK pero gratis/false/null/null/null',
  pg_temp.probar('authenticated', c_auth, replace($q$with i as (insert into negocios (nombre, slug, user_id, pin_caja, plan, plan_manual, plan_expira_at, mp_plan_id, mp_plan_tipo) values ('Trucho', 'prueba-trigger-plan', ':uid', 'pin-1234', 'business', true, now() + interval '10 years', 'x', 'business') returning plan || '/' || plan_manual || '/' || coalesce(plan_expira_at::text, 'null') || '/' || coalesce(mp_plan_id, 'null') || '/' || coalesce(mp_plan_tipo, 'null') as r) select string_agg(r, ',') from i$q$, ':uid', uid::text)) from _ctx
union all
select 11, 'service role: plan -> business', 'OK 1 fila business',
  pg_temp.probar('service_role', c_srv, replace($q$with u as (update negocios set plan = 'business', plan_manual = true where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 12, 'SQL editor (postgres, sin JWT): plan -> pro', 'OK 1 fila pro',
  pg_temp.probar(null, null, replace($q$with u as (update negocios set plan = 'pro' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 13, 'JWT de duenio sin cambio de rol (atajo via funcion definer)', 'ERROR 42501',
  pg_temp.probar(null, c_auth, replace($q$with u as (update negocios set plan = 'business' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 14, 'duenio gratis: agrega sucursal (ya tiene ' || sucursales_antes || ')', 'ERROR si ya tiene 1+, OK si tiene 0',
  pg_temp.probar('authenticated', c_auth, replace($q$with i as (insert into sucursales (negocio_id, nombre, slug, pin_caja) values (':neg', 'Otra', 'otra-prueba', 'pin-1234') returning nombre) select string_agg(nombre, ',') from i$q$, ':neg', neg::text)) from _ctx
union all
select 15, 'duenio gratis: cambia el PIN de su sucursal', 'OK (o 0 filas si no tiene)',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update sucursales set pin_caja = 'otro-pin-1' where negocio_id = ':neg' returning nombre) select coalesce(string_agg(nombre, ','), '0 filas') from u$q$, ':neg', neg::text)) from _ctx
union all
select 16, 'service role: agrega sucursal a negocio gratis', 'OK',
  pg_temp.probar('service_role', c_srv, replace($q$with i as (insert into sucursales (negocio_id, nombre, slug, pin_caja) values (':neg', 'Otra', 'otra-prueba', 'pin-1234') returning nombre) select string_agg(nombre, ',') from i$q$, ':neg', neg::text)) from _ctx
union all
select 17, 'duenio: sube archivo a la carpeta de OTRO negocio (storage)', 'ERROR 42501',
  pg_temp.probar('authenticated', c_auth, $q$with i as (insert into storage.objects (bucket_id, name) values ('negocios-media', '00000000-0000-4000-8000-000000000000/logo.png') returning name) select string_agg(name, ',') from i$q$) from _ctx
union all
select 18, 'duenio: sube archivo a SU carpeta (storage)', 'OK',
  pg_temp.probar('authenticated', c_auth, replace($q$with i as (insert into storage.objects (bucket_id, name) values ('negocios-media', ':neg/logo-prueba.png') returning name) select string_agg(name, ',') from i$q$, ':neg', neg::text)) from _ctx
union all
select 20, 'duenio: vencimiento de puntos (vencimiento_meses)', 'OK 1 fila',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set vencimiento_meses = 6 where id = ':neg' returning plan || ' / venc ' || vencimiento_meses as r) select string_agg(r, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 21, 'duenio: origen (onboarding)', 'OK 1 fila',
  pg_temp.probar('authenticated', c_auth, replace($q$with u as (update negocios set origen = '{"fuente":"chatgpt.com"}' where id = ':neg' returning plan) select string_agg(plan, ',') from u$q$, ':neg', neg::text)) from _ctx
union all
select 22, 'duenio gratis: 2 sucursales en un solo insert', 'ERROR 42501',
  pg_temp.probar('authenticated', c_auth, replace($q$with i as (insert into sucursales (negocio_id, nombre, slug, pin_caja) values (':neg', 'Una', 'una-prueba', 'pin-1234'), (':neg', 'Dos', 'dos-prueba', 'pin-1234') returning nombre) select string_agg(nombre, ',') from i$q$, ':neg', neg::text)) from _ctx;

-- Negocio Pro: hasta 3 sucursales
update negocios set plan = 'pro' where id = (select neg from _ctx);
insert into _res
select 19, 'duenio pro: agrega sucursal (tiene ' || sucursales_antes || ')', 'OK si tiene menos de 3',
  pg_temp.probar('authenticated', c_auth, replace($q$with i as (insert into sucursales (negocio_id, nombre, slug, pin_caja) values (':neg', 'Otra', 'otra-prueba', 'pin-1234') returning nombre) select string_agg(nombre, ',') from i$q$, ':neg', neg::text)) from _ctx;

-- Restaurar
update negocios n set plan = c.plan_orig, plan_manual = c.manual_orig from _ctx c where n.id = c.neg;

commit;

select n, prueba, esperado, resultado,
  (select plan from negocios where id = (select neg from _ctx)) as plan_final
from _res order by n;
