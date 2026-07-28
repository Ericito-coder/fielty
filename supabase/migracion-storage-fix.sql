-- ============================================================
-- FIELTY — Fix: políticas de storage sin scope por negocio
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- Problema: las políticas de insert/update del bucket
-- "negocios-media" (creadas en migracion-seguridad.sql) solo
-- validan bucket_id = 'negocios-media', sin chequear que el
-- path (negocioId/logo.ext) pertenezca al negocio del usuario
-- autenticado. Como el logo se guarda en `${negocio.id}/logo.ext`
-- y el negocio.id es público (viaja en /api/negocio-publico),
-- CUALQUIER dueño autenticado puede subir/sobrescribir el logo
-- de CUALQUIER otro negocio, o subir archivos arbitrarios a
-- rutas arbitrarias dentro del bucket.
--
-- Fix: exigir que el primer segmento del path sea el UUID de
-- un negocio que le pertenece al usuario (mismo helper
-- es_mi_negocio() de migracion-seguridad.sql).
-- ============================================================

drop policy if exists "negocios_media_insert" on storage.objects;
create policy "negocios_media_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'negocios-media'
    and es_mi_negocio(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "negocios_media_update" on storage.objects;
create policy "negocios_media_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'negocios-media'
    and es_mi_negocio(((storage.foldername(name))[1])::uuid)
  );

-- La política de lectura pública queda igual (los logos deben
-- poder verse sin login en la tarjeta del cliente):
-- "negocios_media_read" ya está correcta, no se toca.
