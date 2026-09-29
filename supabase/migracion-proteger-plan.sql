-- =====================================================================
-- Proteger el plan y los limites por plan contra el propio duenio
-- Septiembre 2026
-- =====================================================================
--
-- Problema: el duenio edita su negocio directo contra la base, con la
-- anon key y su sesion (RLS: negocios_owner_update, user_id = auth.uid()).
-- La politica dice QUE FILA puede tocar, no QUE COLUMNAS, y el rol
-- authenticated tiene UPDATE sobre toda la tabla. Resultado: desde la
-- consola del navegador cualquier duenio podia hacer
--
--   supabase.from('negocios').update({ plan: 'business' }).eq('id', suId)
--
-- y quedarse con el plan pago sin pagar. Lo mismo con plan_manual (que
-- ademas evita que el cron lo baje), plan_expira_at, mp_plan_id y
-- mp_plan_tipo, y con el INSERT del onboarding (crear el negocio ya con
-- plan = 'business').
--
-- Los cambios de plan legitimos van todos por el servidor con la service
-- role key: lib/mp.js (sincronizarSuscripcion, webhook, "Ya pague", cron)
-- y /api/admin/update-plan. Ninguno pasa por estos triggers.
--
-- Por que un trigger y no permisos por columna
-- (revoke update on negocios from authenticated; grant update (col, ...)):
--   - Lo que hay que prohibir es una lista chica y estable (las columnas
--     de cobro, que solo escribe el servidor). Lo permitido crece seguido
--     (vencimiento_meses y origen en el ultimo mes): con permisos por
--     columna, cada columna nueva del dashboard necesita su GRANT en prod
--     Y en fielty-dev, y si falta el guardado de Config falla (y
--     ConfigSection.guardar hace setNegocio(null) cuando hay error).
--   - Un "grant all on all tables in schema public to authenticated"
--     (fix tipico de tutoriales y del asistente de Supabase) reabriria el
--     hueco sin que nadie se entere. El trigger no depende de los grants.
--   - Da un mensaje claro en vez de "permission denied for table".
--   Contra: si algun dia se agrega otra columna que solo deba escribir el
--   servidor, hay que sumarla aca.
--
-- Como sabe el trigger quien escribe: PostgREST cambia el rol de la
-- conexion al del JWT (anon / authenticated / service_role) y deja los
-- claims en request.jwt.claims. Se bloquea si CUALQUIERA de los dos dice
-- anon o authenticated. Asi el SQL editor, los crons de pg_cron y la
-- service role key (servidor, panel admin) siguen pudiendo todo, y una
-- funcion security definer invocada por un duenio tampoco sirve de atajo
-- (current_user seria el owner, pero el JWT sigue diciendo authenticated).
--
-- Aplicar desde el SQL editor de Supabase (no por psql en Windows: ver
-- el problema de encoding). Primero en fielty-dev, despues en prod. No
-- requiere deploy: el codigo actual nunca manda estas columnas.
--
-- Para deshacer:
--   drop trigger if exists trg_negocio_proteger_plan on public.negocios;
--   drop trigger if exists trg_sucursal_limite_plan on public.sucursales;
--   drop function if exists public.fn_negocio_proteger_plan();
--   drop function if exists public.fn_sucursal_limite_plan();
--   drop function if exists public.fn_pedido_de_cliente();
--   (las politicas de storage de la seccion 3 no hace falta restaurarlas)
-- =====================================================================

set client_encoding = 'UTF8';

begin;

-- ---------------------------------------------------------------------
-- 0. Quien esta escribiendo
--    true si el pedido viene del navegador (anon key, con o sin sesion).
--
--    NO hacerla security definer: adentro de una funcion definer,
--    current_user es el owner y el chequeo por rol dejaria de servir.
--    NO revocarle execute a anon/authenticated: los triggers la llaman
--    con el rol de quien escribe.
-- ---------------------------------------------------------------------

create or replace function public.fn_pedido_de_cliente()
returns boolean
language sql stable
set search_path = public
as $$
  select current_user in ('anon', 'authenticated')
      or coalesce(
           nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
           ''
         ) in ('anon', 'authenticated')
$$;

-- ---------------------------------------------------------------------
-- 1. negocios: el plan y la suscripcion solo los cambia el servidor
--    - INSERT desde el navegador: se fuerzan los valores por defecto
--      (el onboarding nunca los manda, asi que no cambia nada para el).
--    - UPDATE desde el navegador: si alguna cambia, error 42501 (PostgREST
--      responde 403). Mandar el mismo valor que ya tiene no es error.
-- ---------------------------------------------------------------------

create or replace function public.fn_negocio_proteger_plan()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not fn_pedido_de_cliente() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.plan           := 'gratis';
    new.plan_manual    := false;
    new.plan_expira_at := null;
    new.mp_plan_id     := null;
    new.mp_plan_tipo   := null;
    return new;
  end if;

  if new.plan           is distinct from old.plan
  or new.plan_manual    is distinct from old.plan_manual
  or new.plan_expira_at is distinct from old.plan_expira_at
  or new.mp_plan_id     is distinct from old.mp_plan_id
  or new.mp_plan_tipo   is distinct from old.mp_plan_tipo then
    raise exception 'El plan y la suscripcion de un negocio solo se cambian desde el servidor'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_negocio_proteger_plan on public.negocios;
create trigger trg_negocio_proteger_plan
  before insert or update on public.negocios
  for each row execute function public.fn_negocio_proteger_plan();

-- ---------------------------------------------------------------------
-- 2. sucursales: el limite por plan lo hace cumplir la base
--    El duenio inserta sucursales directo (RLS sucursales_owner_all) y
--    el limite solo lo chequeaba el dashboard, asi que un negocio gratis
--    podia crear las que quisiera desde la consola.
--
--    Tiene que coincidir con LIMITE_SUCURSALES de app/dashboard/page.js:
--    gratis 1, pro / pro_early 3, business sin limite.
--    Un negocio que baja de plan conserva las que ya tenia; solo no puede
--    agregar mas.
-- ---------------------------------------------------------------------

create or replace function public.fn_sucursal_limite_plan()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_plan     text;
  v_limite   int;
  v_actuales int;
begin
  if not fn_pedido_de_cliente() then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.negocio_id is not distinct from old.negocio_id then
    return new;
  end if;

  select plan into v_plan from negocios where id = new.negocio_id;
  v_limite := case
    when v_plan = 'business' then null
    when v_plan in ('pro', 'pro_early') then 3
    else 1
  end;

  if v_limite is null then
    return new;
  end if;

  select count(*) into v_actuales
  from sucursales
  where negocio_id = new.negocio_id
    and id is distinct from new.id;

  if v_actuales >= v_limite then
    raise exception 'Limite de sucursales del plan %: %', coalesce(v_plan, 'gratis'), v_limite
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sucursal_limite_plan on public.sucursales;
create trigger trg_sucursal_limite_plan
  before insert or update of negocio_id on public.sucursales
  for each row execute function public.fn_sucursal_limite_plan();

-- ---------------------------------------------------------------------
-- 3. storage: sacar las politicas viejas de logos
--    migracion-storage-fix.sql limito la subida de logos a la carpeta del
--    negocio propio (negocios_media_insert / negocios_media_update), pero
--    quedaron vivas dos politicas anteriores, creadas desde el dashboard
--    de Supabase, que solo miran el bucket. Las politicas permisivas se
--    suman con OR, asi que el fix no tenia efecto: cualquier usuario
--    logueado podia pisar el logo de cualquier negocio (el id es publico).
-- ---------------------------------------------------------------------

drop policy if exists "Usuarios autenticados pueden subir logos" on storage.objects;
drop policy if exists "Usuarios autenticados pueden actualizar logos" on storage.objects;

commit;

-- ---------------------------------------------------------------------
-- Verificacion: tienen que aparecer los dos triggers nuevos y, en
-- storage.objects, solo negocios_media_insert / _update / _read.
-- ---------------------------------------------------------------------

select 'trigger' as tipo, tgrelid::regclass::text as tabla, tgname as nombre
from pg_trigger
where tgname in ('trg_negocio_proteger_plan', 'trg_sucursal_limite_plan')
union all
select 'politica storage', 'storage.objects', polname
from pg_policy
where polrelid = 'storage.objects'::regclass
order by 1, 3;
