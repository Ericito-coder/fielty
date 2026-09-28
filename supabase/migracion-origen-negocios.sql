-- De donde llego el duenio la primera vez que entro a fielty.app
-- (chatgpt.com, google, instagram, direct...). Lo captura lib/origen.js en
-- el sitio publico y el onboarding lo graba al crear el negocio.
--
-- Queda null en los negocios anteriores a esta migracion: no hay forma
-- confiable de reconstruirlo para ellos.
--
-- Forma: { fuente, landing, fecha, medio?, campana?, referrer? }
--
-- Para ver altas y pagos por canal:
--   select origen->>'fuente' as fuente,
--          count(*) as altas,
--          count(*) filter (where plan in ('pro','pro_early','business')) as pagos
--   from negocios
--   where origen is not null
--   group by 1 order by 2 desc;

alter table negocios add column if not exists origen jsonb;
