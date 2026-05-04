-- =============================================================================
-- 002_pages_modules.sql
-- Módulos de página: catálogo, promociones, about, faq, galería y blog.
-- Depende de 001_businesses.sql.
--
-- Cambios respecto al esquema anterior:
--   · catalogs        → catalog_pages
--   · categories      → catalog_categories  (sin business_id, sin image_url)
--   · products        → catalog_products    (sin business_id, sin tags)
--   · promotions                            (sin product_ids, sin category_ids)
--   · business_about  → about
--   · business_faq_items → faq
--   · gallery_albums                        (sin cover_image_url)
--   · gallery_photos                        (conserva business_id para queries directas)
--   · business_blog_posts → blog_posts
-- =============================================================================


-- ── catalog_pages ─────────────────────────────────────────────────────────────
CREATE TABLE catalog_pages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);

CREATE TRIGGER trg_catalog_pages_updated_at
  BEFORE UPDATE ON catalog_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE catalog_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_pages_select_public"
  ON catalog_pages FOR SELECT USING (true);

CREATE POLICY "catalog_pages_insert_admin"
  ON catalog_pages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "catalog_pages_update_admin"
  ON catalog_pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "catalog_pages_delete_admin"
  ON catalog_pages FOR DELETE TO authenticated USING (true);


-- ── catalog_categories ────────────────────────────────────────────────────────
-- Sin business_id: el negocio se resuelve vía catalog_pages.business_id.
-- Sin image_url: no implementado en este sprint.
CREATE TABLE catalog_categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id  UUID        NOT NULL REFERENCES catalog_pages(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (catalog_id, slug)
);

CREATE TRIGGER trg_catalog_categories_updated_at
  BEFORE UPDATE ON catalog_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE catalog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_categories_select_public"
  ON catalog_categories FOR SELECT USING (true);

CREATE POLICY "catalog_categories_insert_admin"
  ON catalog_categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "catalog_categories_update_admin"
  ON catalog_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "catalog_categories_delete_admin"
  ON catalog_categories FOR DELETE TO authenticated USING (true);


-- ── catalog_products ──────────────────────────────────────────────────────────
-- Sin business_id: el negocio se resuelve vía category → catalog_pages.business_id.
-- Sin tags: funcionalidad pendiente de sprint futuro.
CREATE TABLE catalog_products (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID          NOT NULL REFERENCES catalog_categories(id) ON DELETE CASCADE,
  slug            TEXT          NOT NULL,
  name            TEXT          NOT NULL,
  description     TEXT,
  money           JSONB         NOT NULL DEFAULT '{"amount":0,"currency":"CUP"}',
  is_available    BOOLEAN       NOT NULL DEFAULT true,
  is_featured     BOOLEAN       NOT NULL DEFAULT false,
  badge           TEXT,
  image_url       TEXT,
  sort_order      INTEGER       NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

CREATE TRIGGER trg_catalog_products_updated_at
  BEFORE UPDATE ON catalog_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_products_select_public"
  ON catalog_products FOR SELECT USING (true);

CREATE POLICY "catalog_products_insert_admin"
  ON catalog_products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "catalog_products_update_admin"
  ON catalog_products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "catalog_products_delete_admin"
  ON catalog_products FOR DELETE TO authenticated USING (true);


-- ── promotions ────────────────────────────────────────────────────────────────
-- Sin product_ids / category_ids a nivel de columna.
-- Las referencias a productos/categorías se mantienen dentro del JSONB rules[].
CREATE TABLE promotions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  description    TEXT,
  image_url      TEXT,
  status         TEXT        NOT NULL DEFAULT 'active',
  discount_label TEXT,
  starts_at      TIMESTAMPTZ,
  ends_at        TIMESTAMPTZ,
  rules          JSONB,
  sort_order     INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotions_select_public"
  ON promotions FOR SELECT USING (true);

CREATE POLICY "promotions_insert_admin"
  ON promotions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "promotions_update_admin"
  ON promotions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "promotions_delete_admin"
  ON promotions FOR DELETE TO authenticated USING (true);


-- ── about ─────────────────────────────────────────────────────────────────────
CREATE TABLE about (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  story            TEXT[]      NOT NULL DEFAULT '{}',
  mission          TEXT,
  differentiators  JSONB       NOT NULL DEFAULT '[]',
  team_image_url   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_about_updated_at
  BEFORE UPDATE ON about
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE about ENABLE ROW LEVEL SECURITY;

CREATE POLICY "about_select_public"
  ON about FOR SELECT USING (true);

CREATE POLICY "about_insert_admin"
  ON about FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "about_update_admin"
  ON about FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "about_delete_admin"
  ON about FOR DELETE TO authenticated USING (true);


-- ── faq ───────────────────────────────────────────────────────────────────────
CREATE TABLE faq (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  category    TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_faq_updated_at
  BEFORE UPDATE ON faq
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faq_select_public"
  ON faq FOR SELECT USING (true);

CREATE POLICY "faq_insert_admin"
  ON faq FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "faq_update_admin"
  ON faq FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "faq_delete_admin"
  ON faq FOR DELETE TO authenticated USING (true);


-- ── gallery_albums ────────────────────────────────────────────────────────────
-- Sin cover_image_url: se puede derivar de la primera foto del álbum.
CREATE TABLE gallery_albums (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);

CREATE TRIGGER trg_gallery_albums_updated_at
  BEFORE UPDATE ON gallery_albums
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_albums_select_public"
  ON gallery_albums FOR SELECT USING (true);

CREATE POLICY "gallery_albums_insert_admin"
  ON gallery_albums FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "gallery_albums_update_admin"
  ON gallery_albums FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "gallery_albums_delete_admin"
  ON gallery_albums FOR DELETE TO authenticated USING (true);


-- ── gallery_photos ────────────────────────────────────────────────────────────
-- Conserva business_id para queries directas por negocio.
CREATE TABLE gallery_photos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  album_id    UUID        NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url   TEXT        NOT NULL,
  alt         TEXT        NOT NULL DEFAULT '',
  caption     TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_gallery_photos_updated_at
  BEFORE UPDATE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_photos_select_public"
  ON gallery_photos FOR SELECT USING (true);

CREATE POLICY "gallery_photos_insert_admin"
  ON gallery_photos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "gallery_photos_update_admin"
  ON gallery_photos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "gallery_photos_delete_admin"
  ON gallery_photos FOR DELETE TO authenticated USING (true);


-- ── blog ─────────────────────────────────────────────────────────────────────
CREATE TABLE blog (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug         TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  summary      TEXT,
  body         TEXT[]      NOT NULL DEFAULT '{}',
  published_at DATE,
  author       TEXT,
  tags         TEXT[]      NOT NULL DEFAULT '{}',
  is_published BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);

CREATE TRIGGER trg_blog_updated_at
  BEFORE UPDATE ON blog
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE blog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_select_public"
  ON blog FOR SELECT USING (true);

CREATE POLICY "blog_insert_admin"
  ON blog FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "blog_update_admin"
  ON blog FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "blog_delete_admin"
  ON blog FOR DELETE TO authenticated USING (true);
