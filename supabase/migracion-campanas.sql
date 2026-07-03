-- ============================================================
-- FIELTY — Migración: campañas de email
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- (igual que la migración de seguridad; tarda 1 segundo)
-- ============================================================

-- Opt-out y control de frecuencia por cliente
alter table public.clientes
  add column if not exists acepta_marketing boolean not null default true;
alter table public.clientes
  add column if not exists ultima_campana_at timestamptz;

-- Historial de campañas
create table if not exists public.campanas (
  id         uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  segmento   text not null,
  asunto     text not null,
  mensaje    text not null,
  enviados   int  not null default 0,
  created_at timestamptz not null default now()
);

-- A quién se le envió cada campaña (para medir cuántos volvieron)
create table if not exists public.campana_envios (
  campana_id uuid not null references public.campanas(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  negocio_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (campana_id, cliente_id)
);

-- RLS: el dueño lee sus campañas desde el dashboard;
-- las escrituras van por la ruta API (service role).
alter table public.campanas       enable row level security;
alter table public.campana_envios enable row level security;

drop policy if exists campanas_owner_select on public.campanas;
create policy campanas_owner_select on public.campanas
  for select to authenticated using (es_mi_negocio(negocio_id));

drop policy if exists campana_envios_owner_select on public.campana_envios;
create policy campana_envios_owner_select on public.campana_envios
  for select to authenticated using (es_mi_negocio(negocio_id));
