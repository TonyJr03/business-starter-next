-- =============================================================================
-- 004_business_admins.sql
-- Tabla de administradores por negocio + tightening de RLS.
-- Depende de 001_businesses.sql y 003_platform_admins.sql.
--
-- Problema que resuelve:
--   Las políticas anteriores usaban `TO authenticated USING (true)`, lo que
--   permitía a cualquier usuario autenticado mutar datos de cualquier negocio.
--
-- Solución:
--   1. Tabla `business_admins` — relación user ↔ business para admins de tenant.
--   2. Función helper `is_business_admin(bid)` — usada en todas las policies.
--      Retorna true si el usuario es admin del negocio O si es platform_admin.
--   3. Drop + recreación de todas las policies de escritura en businesses y
--      tablas de contenido, reemplazando USING(true) por is_business_admin().
-- =============================================================================


-- =============================================================================
-- 1. Tabla business_admins
-- =============================================================================

CREATE TABLE business_admins (
  user_id     UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  business_id UUID        NOT NULL REFERENCES businesses(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, business_id)
);

ALTER TABLE business_admins ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede ver sus propias membresías (se usa en getAdminContext)
CREATE POLICY "business_admins_select_self"
  ON business_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Solo los platform_admins pueden asignar y revocar membresías
CREATE POLICY "business_admins_insert_superadmin"
  ON business_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "business_admins_delete_superadmin"
  ON business_admins FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  );


-- =============================================================================
-- 2. Función helper is_business_admin
--
-- SECURITY DEFINER + STABLE: ejecuta como el owner de la función (sin RLS
-- sobre business_admins / platform_admins) y puede ser cacheada por query.
-- search_path fijado a public para evitar inyección de esquema.
-- =============================================================================

CREATE OR REPLACE FUNCTION is_business_admin(bid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM business_admins
      WHERE user_id = auth.uid() AND business_id = bid
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid()
    )
$$;


-- =============================================================================
-- 3. businesses — tighten UPDATE, añadir DELETE
-- =============================================================================

DROP POLICY IF EXISTS "businesses_update_admin" ON businesses;

CREATE POLICY "businesses_update_admin"
  ON businesses FOR UPDATE
  TO authenticated
  USING  (is_business_admin(id))
  WITH CHECK (is_business_admin(id));

-- DELETE solo para platform_admins (eliminar un negocio es una operación
-- irreversible que no debería delegarse al admin del tenant)
CREATE POLICY "businesses_delete_superadmin"
  ON businesses FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  );


-- =============================================================================
-- 4. catalog_pages
-- =============================================================================

DROP POLICY IF EXISTS "catalog_pages_insert_admin" ON catalog_pages;
DROP POLICY IF EXISTS "catalog_pages_update_admin" ON catalog_pages;
DROP POLICY IF EXISTS "catalog_pages_delete_admin" ON catalog_pages;

CREATE POLICY "catalog_pages_insert_admin"
  ON catalog_pages FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "catalog_pages_update_admin"
  ON catalog_pages FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "catalog_pages_delete_admin"
  ON catalog_pages FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));


-- =============================================================================
-- 5. catalog_categories
-- =============================================================================

DROP POLICY IF EXISTS "catalog_categories_insert_admin" ON catalog_categories;
DROP POLICY IF EXISTS "catalog_categories_update_admin" ON catalog_categories;
DROP POLICY IF EXISTS "catalog_categories_delete_admin" ON catalog_categories;

CREATE POLICY "catalog_categories_insert_admin"
  ON catalog_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "catalog_categories_update_admin"
  ON catalog_categories FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "catalog_categories_delete_admin"
  ON catalog_categories FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));


-- =============================================================================
-- 6. catalog_products
-- =============================================================================

DROP POLICY IF EXISTS "catalog_products_insert_admin" ON catalog_products;
DROP POLICY IF EXISTS "catalog_products_update_admin" ON catalog_products;
DROP POLICY IF EXISTS "catalog_products_delete_admin" ON catalog_products;

CREATE POLICY "catalog_products_insert_admin"
  ON catalog_products FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "catalog_products_update_admin"
  ON catalog_products FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "catalog_products_delete_admin"
  ON catalog_products FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));


-- =============================================================================
-- 7. promotions
-- =============================================================================

DROP POLICY IF EXISTS "promotions_insert_admin" ON promotions;
DROP POLICY IF EXISTS "promotions_update_admin" ON promotions;
DROP POLICY IF EXISTS "promotions_delete_admin" ON promotions;

CREATE POLICY "promotions_insert_admin"
  ON promotions FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "promotions_update_admin"
  ON promotions FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "promotions_delete_admin"
  ON promotions FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));


-- =============================================================================
-- 8. about
-- =============================================================================

DROP POLICY IF EXISTS "about_insert_admin" ON about;
DROP POLICY IF EXISTS "about_update_admin" ON about;
DROP POLICY IF EXISTS "about_delete_admin" ON about;

CREATE POLICY "about_insert_admin"
  ON about FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "about_update_admin"
  ON about FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "about_delete_admin"
  ON about FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));


-- =============================================================================
-- 9. faq
-- =============================================================================

DROP POLICY IF EXISTS "faq_insert_admin" ON faq;
DROP POLICY IF EXISTS "faq_update_admin" ON faq;
DROP POLICY IF EXISTS "faq_delete_admin" ON faq;

CREATE POLICY "faq_insert_admin"
  ON faq FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "faq_update_admin"
  ON faq FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "faq_delete_admin"
  ON faq FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));


-- =============================================================================
-- 10. gallery_albums
-- =============================================================================

DROP POLICY IF EXISTS "gallery_albums_insert_admin" ON gallery_albums;
DROP POLICY IF EXISTS "gallery_albums_update_admin" ON gallery_albums;
DROP POLICY IF EXISTS "gallery_albums_delete_admin" ON gallery_albums;

CREATE POLICY "gallery_albums_insert_admin"
  ON gallery_albums FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "gallery_albums_update_admin"
  ON gallery_albums FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "gallery_albums_delete_admin"
  ON gallery_albums FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));


-- =============================================================================
-- 11. gallery_photos
-- =============================================================================

DROP POLICY IF EXISTS "gallery_photos_insert_admin" ON gallery_photos;
DROP POLICY IF EXISTS "gallery_photos_update_admin" ON gallery_photos;
DROP POLICY IF EXISTS "gallery_photos_delete_admin" ON gallery_photos;

CREATE POLICY "gallery_photos_insert_admin"
  ON gallery_photos FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "gallery_photos_update_admin"
  ON gallery_photos FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "gallery_photos_delete_admin"
  ON gallery_photos FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));


-- =============================================================================
-- 12. blog
-- =============================================================================

DROP POLICY IF EXISTS "blog_insert_admin" ON blog;
DROP POLICY IF EXISTS "blog_update_admin" ON blog;
DROP POLICY IF EXISTS "blog_delete_admin" ON blog;

CREATE POLICY "blog_insert_admin"
  ON blog FOR INSERT
  TO authenticated
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "blog_update_admin"
  ON blog FOR UPDATE
  TO authenticated
  USING  (is_business_admin(business_id))
  WITH CHECK (is_business_admin(business_id));

CREATE POLICY "blog_delete_admin"
  ON blog FOR DELETE
  TO authenticated
  USING (is_business_admin(business_id));
