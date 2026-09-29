-- ============================================================
-- FIELTY — Migración: seguimiento automático de altas nuevas
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- Idempotente: se puede correr de nuevo sin efectos.
-- ============================================================

-- ------------------------------------------------------------
-- Qué mail de seguimiento recibió cada dueño de negocio.
--
-- Existe para una sola cosa: que el cron no mande dos veces el mismo
-- mail. `ok` guarda si Resend aceptó el envío — un false acá significa
-- que ese dueño quedó sin contactar y conviene mirarlo a mano.
--
-- OJO: `ok = true` NO quiere decir que el mail haya llegado. Un rebote
-- se entera después y por webhook; hoy Fielty no los escucha (ver el
-- caso de Ice Roll Thai, que rebotó el 23/08 sin que nadie se enterara).
-- ------------------------------------------------------------
create table if not exists public.negocio_emails (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid not null references public.negocios(id) on delete cascade,
  etapa       text not null,
  enviado_at  timestamptz not null default now(),
  ok          boolean not null default true
);

-- La garantía anti-duplicado vive acá y no en el código: si el cron
-- corriera dos veces, el segundo insert falla y el dueño no recibe el
-- mail repetido. El código se apoya en este índice, no lo reemplaza.
create unique index if not exists negocio_emails_etapa_idx
  on public.negocio_emails(negocio_id, etapa);

-- Para la regla de "un mail cada 7 días como máximo por negocio".
create index if not exists negocio_emails_negocio_idx
  on public.negocio_emails(negocio_id, enviado_at desc);

alter table public.negocio_emails enable row level security;
-- (sin políticas: solo el service role la lee/escribe)

-- ------------------------------------------------------------
-- Semilla 1: la base histórica queda afuera para siempre.
--
-- La secuencia es para altas nuevas. Mandarle "¿te doy una mano para
-- arrancar?" a alguien que se registró hace un mes — o peor, a uno de
-- los que ya están pagando desde julio — es más dañino que no
-- escribirle. Se marcan las tres etapas como ya enviadas para todo lo
-- anterior al 21/08/2026, que es donde empieza esta tanda.
-- ------------------------------------------------------------
insert into public.negocio_emails (negocio_id, etapa, enviado_at)
select n.id, e.etapa, now()
from public.negocios n
cross join (values ('setup_incompleto'), ('sin_clientes'), ('primeros_clientes')) as e(etapa)
where n.created_at < timestamptz '2026-08-21'
on conflict do nothing;

-- ------------------------------------------------------------
-- Semilla 2: los 7 mails que se mandaron a mano el 25/08/2026.
--
-- Se marca SOLO la etapa que cada uno recibió, no las tres: si mañana
-- DOHA carga sus primeros clientes, la secuencia sigue sola con el
-- mail que corresponda.
-- ------------------------------------------------------------
insert into public.negocio_emails (negocio_id, etapa, enviado_at)
select n.id, e.etapa, timestamptz '2026-08-25 18:22:00+00'
from (values
  ('sr-academy-beauty', 'setup_incompleto'),
  ('ice-roll-thai',     'sin_clientes'),
  ('doha',              'sin_clientes'),
  ('farmacia-haramina', 'primeros_clientes'),
  ('bghcross',          'primeros_clientes'),
  ('combo-express',     'primeros_clientes'),
  ('raiz',              'primeros_clientes')
) as e(slug, etapa)
join public.negocios n on n.slug = e.slug
on conflict do nothing;
