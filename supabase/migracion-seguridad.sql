-- ============================================================
-- FIELTY — Migración de seguridad
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- Qué hace:
--   1. Habilita Row Level Security (RLS) en todas las tablas.
--      La anon key deja de poder leer/escribir datos: solo los
--      dueños autenticados ven SU negocio. Las páginas públicas
--      (tarjeta, caja, registro) pasan por las rutas API del
--      servidor, que usan la service role key.
--   2. Crea funciones atómicas para puntos y canjes (evitan
--      race conditions y doble canje).
--   3. Políticas de storage para el bucket de logos.
--
-- IMPORTANTE: deployar el código nuevo ANTES de ejecutar esto.
-- ============================================================


-- ------------------------------------------------------------
-- 1. RLS
-- ------------------------------------------------------------

alter table public.negocios      enable row level security;
alter table public.clientes      enable row level security;
alter table public.recompensas   enable row level security;
alter table public.canjes        enable row level security;
alter table public.transacciones enable row level security;
alter table public.sucursales    enable row level security;

-- Helper: ¿el negocio pertenece al usuario autenticado?
-- security definer para no depender de las políticas de negocios.
create or replace function public.es_mi_negocio(p_negocio_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from negocios
    where id = p_negocio_id and user_id = auth.uid()
  )
$$;

-- --- negocios: el dueño ve y edita solo el suyo ---
drop policy if exists negocios_owner_select on public.negocios;
create policy negocios_owner_select on public.negocios
  for select to authenticated using (user_id = auth.uid());

drop policy if exists negocios_owner_insert on public.negocios;
create policy negocios_owner_insert on public.negocios
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists negocios_owner_update on public.negocios;
create policy negocios_owner_update on public.negocios
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- --- clientes: el dueño solo lee (las escrituras van por API) ---
drop policy if exists clientes_owner_select on public.clientes;
create policy clientes_owner_select on public.clientes
  for select to authenticated using (es_mi_negocio(negocio_id));

-- --- recompensas: el dueño administra las suyas ---
drop policy if exists recompensas_owner_all on public.recompensas;
create policy recompensas_owner_all on public.recompensas
  for all to authenticated
  using (es_mi_negocio(negocio_id))
  with check (es_mi_negocio(negocio_id));

-- --- canjes / transacciones: el dueño solo lee ---
drop policy if exists canjes_owner_select on public.canjes;
create policy canjes_owner_select on public.canjes
  for select to authenticated using (es_mi_negocio(negocio_id));

drop policy if exists transacciones_owner_select on public.transacciones;
create policy transacciones_owner_select on public.transacciones
  for select to authenticated using (es_mi_negocio(negocio_id));

-- --- sucursales: el dueño administra las suyas ---
drop policy if exists sucursales_owner_all on public.sucursales;
create policy sucursales_owner_all on public.sucursales
  for all to authenticated
  using (es_mi_negocio(negocio_id))
  with check (es_mi_negocio(negocio_id));


-- ------------------------------------------------------------
-- 2. Funciones atómicas (las usan las rutas API vía rpc)
-- ------------------------------------------------------------

-- Acreditar puntos por compra: suma puntos + históricos + visita
-- en un solo UPDATE (sin leer-y-escribir desde la app).
create or replace function public.fn_acreditar_visita(p_cliente_id uuid, p_puntos int)
returns table (puntos int, puntos_historicos int)
language plpgsql security definer
set search_path = public
as $$
begin
  return query
  update clientes c
  set puntos            = c.puntos + p_puntos,
      puntos_historicos = coalesce(c.puntos_historicos, 0) + p_puntos,
      visitas           = coalesce(c.visitas, 0) + 1,
      ultima_visita     = now()
  where c.id = p_cliente_id
  returning c.puntos, c.puntos_historicos;
end;
$$;

-- Canjear una recompensa: valida saldo, descuenta puntos, crea el
-- canje y registra la transacción — todo en una sola transacción.
create or replace function public.fn_canjear(
  p_cliente_id uuid,
  p_recompensa_id uuid,
  p_codigo text,
  p_expira_at timestamptz
)
returns json
language plpgsql security definer
set search_path = public
as $$
declare
  v_cliente clientes%rowtype;
  v_rec     recompensas%rowtype;
begin
  select * into v_cliente from clientes where id = p_cliente_id for update;
  if not found then
    raise exception 'cliente_no_encontrado';
  end if;

  select * into v_rec from recompensas
  where id = p_recompensa_id
    and negocio_id = v_cliente.negocio_id
    and activa;
  if not found then
    raise exception 'recompensa_no_disponible';
  end if;

  if v_cliente.puntos < v_rec.puntos_necesarios then
    raise exception 'puntos_insuficientes';
  end if;

  update clientes set puntos = puntos - v_rec.puntos_necesarios
  where id = p_cliente_id;

  insert into canjes (cliente_id, negocio_id, recompensa_id, codigo, estado, puntos_descontados, expira_at)
  values (p_cliente_id, v_cliente.negocio_id, p_recompensa_id, p_codigo, 'pendiente', v_rec.puntos_necesarios, p_expira_at);

  insert into transacciones (cliente_id, negocio_id, tipo, puntos, descripcion)
  values (p_cliente_id, v_cliente.negocio_id, 'canje', v_rec.puntos_necesarios, 'Canje: ' || v_rec.nombre);

  return json_build_object('puntos', v_cliente.puntos - v_rec.puntos_necesarios);
end;
$$;

-- Expirar un canje pendiente y devolver los puntos al cliente.
-- Devuelve false si el canje ya no estaba pendiente (evita
-- devoluciones dobles).
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

-- Confirmar un canje en la caja. Solo pasa a 'usado' si sigue
-- pendiente y no venció — dos cajas no pueden confirmar el mismo
-- código dos veces.
create or replace function public.fn_confirmar_canje(p_canje_id uuid, p_sucursal_id uuid default null)
returns boolean
language plpgsql security definer
set search_path = public
as $$
begin
  update canjes
  set estado = 'usado',
      usado_at = now(),
      sucursal_id = coalesce(p_sucursal_id, sucursal_id)
  where id = p_canje_id
    and estado = 'pendiente'
    and expira_at > now();
  return found;
end;
$$;

-- Cumpleaños del día (cron diario): acredita los puntos de regalo
-- a cada cliente que cumple años hoy (hora argentina). El chequeo de
-- "ya recibió este año" evita duplicados si el cron corre dos veces.
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

-- Rate limiting persistente (sirve en serverless, donde la memoria
-- no se comparte entre instancias). Devuelve true si el intento
-- está permitido.
create table if not exists public.rate_limits (
  key      text primary key,
  count    int not null default 0,
  reset_at timestamptz not null
);
alter table public.rate_limits enable row level security;
-- (sin políticas: solo el service role la toca)

create or replace function public.fn_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into rate_limits as rl (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count    = case when rl.reset_at < now() then 1 else rl.count + 1 end,
        reset_at = case when rl.reset_at < now() then now() + make_interval(secs => p_window_seconds) else rl.reset_at end
  returning count into v_count;

  -- Limpieza ocasional de claves viejas
  if random() < 0.01 then
    delete from rate_limits where reset_at < now() - interval '1 day';
  end if;

  return v_count <= p_max;
end;
$$;

-- Estas funciones son solo para el servidor (service role):
revoke execute on function public.fn_acreditar_visita(uuid, int) from public, anon, authenticated;
revoke execute on function public.fn_canjear(uuid, uuid, text, timestamptz) from public, anon, authenticated;
revoke execute on function public.fn_expirar_canje(uuid) from public, anon, authenticated;
revoke execute on function public.fn_confirmar_canje(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.fn_acreditar_cumpleanos() from public, anon, authenticated;
revoke execute on function public.fn_rate_limit(text, int, int) from public, anon, authenticated;


-- ------------------------------------------------------------
-- 3. Storage: logos (bucket negocios-media)
--    Lectura pública, escritura solo para dueños autenticados.
--    Si ya tenés políticas propias en este bucket, revisá antes.
-- ------------------------------------------------------------

drop policy if exists "negocios_media_read" on storage.objects;
create policy "negocios_media_read" on storage.objects
  for select to public using (bucket_id = 'negocios-media');

drop policy if exists "negocios_media_insert" on storage.objects;
create policy "negocios_media_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'negocios-media');

drop policy if exists "negocios_media_update" on storage.objects;
create policy "negocios_media_update" on storage.objects
  for update to authenticated using (bucket_id = 'negocios-media');
