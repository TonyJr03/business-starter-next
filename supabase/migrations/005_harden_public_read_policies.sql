-- =============================================================================
-- 005_harden_public_read_policies.sql
-- Endurece la lectura publica de negocios y contenido.
--
-- Decision Fase 3.2:
--   - No se replica businesses.modules en RLS.
--   - RLS protege estados claros de publicacion y visibilidad.
--
-- Nota importante:
--   En PostgreSQL, multiples policies permisivas para una misma accion se
--   combinan con OR. Por eso se dropean las SELECT publicas anteriores con
--   USING (true) antes de crear policies restrictivas.
--
-- Esta migracion no toca policies de escritura.
-- =============================================================================


-- =============================================================================
-- 1. Helpers de lectura
-- =============================================================================

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
$$;


CREATE OR REPLACE FUNCTION is_public_business(bid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM businesses
    WHERE id = bid
      AND is_active = true
  )
$$;


CREATE OR REPLACE FUNCTION is_public_catalog_page(page_id UUID, bid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM catalog_pages
    WHERE id = page_id
      AND business_id = bid
      AND is_active = true
      AND is_public_business(bid)
  )
$$;


CREATE OR REPLACE FUNCTION is_public_catalog_category(category_id UUID, bid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM catalog_categories cc
    WHERE cc.id = category_id
      AND cc.business_id = bid
      AND cc.is_active = true
      AND is_public_catalog_page(cc.catalog_id, bid)
  )
$$;


CREATE OR REPLACE FUNCTION is_public_gallery_album(album_id UUID, bid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM gallery_albums
    WHERE id = album_id
      AND business_id = bid
      AND is_active = true
      AND is_public_business(bid)
  )
$$;


-- =============================================================================
-- 2. Drop de SELECT policies permisivas anteriores
-- =============================================================================

DROP POLICY IF EXISTS "businesses_select_public" ON businesses;
DROP POLICY IF EXISTS "business_admins_select_self" ON business_admins;
DROP POLICY IF EXISTS "platform_admins_select_self" ON platform_admins;
DROP POLICY IF EXISTS "catalog_pages_select_public" ON catalog_pages;
DROP POLICY IF EXISTS "catalog_categories_select_public" ON catalog_categories;
DROP POLICY IF EXISTS "catalog_products_select_public" ON catalog_products;
DROP POLICY IF EXISTS "promotions_select_public" ON promotions;
DROP POLICY IF EXISTS "about_select_public" ON about;
DROP POLICY IF EXISTS "faq_select_public" ON faq;
DROP POLICY IF EXISTS "gallery_albums_select_public" ON gallery_albums;
DROP POLICY IF EXISTS "gallery_photos_select_public" ON gallery_photos;
DROP POLICY IF EXISTS "blog_select_public" ON blog;


-- =============================================================================
-- 3. Nuevas SELECT policies
-- =============================================================================

CREATE POLICY "businesses_select_public_or_admin"
  ON businesses FOR SELECT
  USING (
    is_active = true
    OR is_business_admin(id)
    OR is_platform_admin()
  );


CREATE POLICY "business_admins_select_self_or_platform"
  ON business_admins FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_platform_admin()
  );


CREATE POLICY "platform_admins_select_self_or_platform"
  ON platform_admins FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_platform_admin()
  );


CREATE POLICY "catalog_pages_select_public_or_admin"
  ON catalog_pages FOR SELECT
  USING (
    is_public_catalog_page(id, business_id)
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );


CREATE POLICY "catalog_categories_select_public_or_admin"
  ON catalog_categories FOR SELECT
  USING (
    is_public_catalog_category(id, business_id)
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );


CREATE POLICY "catalog_products_select_public_or_admin"
  ON catalog_products FOR SELECT
  USING (
    (
      is_public_business(business_id)
      AND is_available = true
      AND is_public_catalog_category(category_id, business_id)
    )
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );


CREATE POLICY "promotions_select_public_or_admin"
  ON promotions FOR SELECT
  USING (
    (
      is_public_business(business_id)
      AND status = 'active'
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now())
    )
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );


CREATE POLICY "about_select_public_or_admin"
  ON about FOR SELECT
  USING (
    is_public_business(business_id)
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );


CREATE POLICY "faq_select_public_or_admin"
  ON faq FOR SELECT
  USING (
    (
      is_public_business(business_id)
      AND is_active = true
    )
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );


CREATE POLICY "gallery_albums_select_public_or_admin"
  ON gallery_albums FOR SELECT
  USING (
    is_public_gallery_album(id, business_id)
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );


CREATE POLICY "gallery_photos_select_public_or_admin"
  ON gallery_photos FOR SELECT
  USING (
    (
      is_public_business(business_id)
      AND is_active = true
      AND is_public_gallery_album(album_id, business_id)
    )
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );


CREATE POLICY "blog_select_public_or_admin"
  ON blog FOR SELECT
  USING (
    (
      is_public_business(business_id)
      AND is_published = true
      AND published_at IS NOT NULL
      AND published_at <= ((now() AT TIME ZONE 'America/Havana')::date)
    )
    OR is_business_admin(business_id)
    OR is_platform_admin()
  );
