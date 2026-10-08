-- ============================================================
-- FIELTY — Migración: consentimiento de promociones
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- (tarda 1 segundo; aplicarla ANTES de deployar el código que la usa)
-- ============================================================

-- Cuándo el cliente vio la casilla "Quiero recibir novedades y
-- promociones" en la pantalla de bienvenida del registro y la dejó
-- marcada. La casilla viene marcada (decisión de Eric, 07/10/2026), así
-- que la fecha no prueba que la haya marcado él: prueba que la tuvo
-- adelante y no la sacó.
--
-- `acepta_marketing` nace en true para todos y por sí solo no dice nada:
-- sirve para la baja de las campañas de mail. Esta fecha queda en null
-- para los clientes anteriores a esta migración y para los que carga el
-- negocio (desde la caja o en el alta), que nunca vieron la casilla.
--
-- Antes de usarla para un canal que exige consentimiento explícito, como
-- las promociones por WhatsApp, revisar si una casilla premarcada alcanza
-- para ese canal.
alter table public.clientes
  add column if not exists acepta_marketing_at timestamptz;
