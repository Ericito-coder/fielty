-- ============================================================
-- FIELTY — Migración: suscripciones robustas
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- Problema que resuelve: cada click en "Pagar" creaba un plan
-- nuevo en Mercado Pago y sobreescribía negocios.mp_plan_id, así
-- que los pagos hechos con un link anterior quedaban huérfanos
-- (imposibles de asociar a un negocio). Ahora se guarda el
-- historial completo de intentos.
-- ============================================================

-- Historial de intentos de suscripción (no se sobreescribe nunca)
create table if not exists public.suscripciones (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid not null references public.negocios(id) on delete cascade,
  mp_plan_id  text not null,
  plan_tipo   text not null,
  estado      text not null default 'pendiente',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists suscripciones_mp_plan_id_idx on public.suscripciones(mp_plan_id);
create index if not exists suscripciones_negocio_idx on public.suscripciones(negocio_id);

alter table public.suscripciones enable row level security;

drop policy if exists suscripciones_owner_select on public.suscripciones;
create policy suscripciones_owner_select on public.suscripciones
  for select to authenticated using (es_mi_negocio(negocio_id));

-- Log de eventos del webhook de Mercado Pago (para diagnosticar
-- pagos que no impactan, y detectar huérfanos)
create table if not exists public.mp_eventos (
  id          uuid primary key default gen_random_uuid(),
  tipo        text,
  data_id     text,
  estado      text,
  negocio_id  uuid,
  resuelto    boolean not null default false,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists mp_eventos_created_idx on public.mp_eventos(created_at desc);

alter table public.mp_eventos enable row level security;
-- (sin políticas: solo el service role la lee/escribe)

-- Backfill: pasar los mp_plan_id que ya están en negocios al historial
insert into public.suscripciones (negocio_id, mp_plan_id, plan_tipo, estado)
select id, mp_plan_id, coalesce(mp_plan_tipo, 'pro_early'),
       case when plan is null or plan = 'gratis' then 'pendiente' else 'activa' end
from public.negocios
where mp_plan_id is not null
  and not exists (
    select 1 from public.suscripciones s where s.mp_plan_id = negocios.mp_plan_id
  );
