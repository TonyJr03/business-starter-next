-- =============================================================================
-- Migración: tabla catalogs + catalog_id en categories
-- Fecha: 2026-04-29
--
-- Introduce la entidad Catalog como agrupador de categorías.
-- Permite que un negocio tenga uno o más catálogos (ej. 'Cafetería', 'Dulcería').
--
-- Regla de dominio:
--   · Siempre existe al menos un catálogo por negocio.
--   · Toda categoría pertenece a exactamente un catálogo (NOT NULL).
--   · El comportamiento multi-catálogo se activa cuando catalogs.count >= 2.
--     Con un solo catálogo, la UI lo trata como catálogo único (sin selección).
--
-- Impacto en tablas existentes:
--   · categories → nueva columna catalog_id UUID NOT NULL.
--     Esta migración requiere que la tabla esté vacía o que se re-semille
--     (supabase db reset). En entornos de dev es la vía estándar.
-- =============================================================================


-- =============================================================================
-- Tabla: catalogs
-- =============================================================================
CREATE TABLE catalogs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug         TEXT        NOT NULL,
  name         TEXT        NOT NULL,
  description  TEXT,
  image_url    TEXT,
  sort_order   INT         NOT NULL DEFAULT 0,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (business_id, slug)
);

CREATE INDEX idx_catalogs_business_id ON catalogs (business_id);
CREATE INDEX idx_catalogs_is_active   ON catalogs (business_id, is_active);

CREATE TRIGGER trg_catalogs_updated_at
  BEFORE UPDATE ON catalogs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_catalogs"
  ON catalogs FOR SELECT USING (true);


-- =============================================================================
-- Añadir catalog_id a categories
--
-- Se añade como NOT NULL. Requiere que categories esté vacía al ejecutarse
-- (se garantiza mediante supabase db reset + seed).
-- =============================================================================
ALTER TABLE categories
  ADD COLUMN catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE RESTRICT;

CREATE INDEX idx_categories_catalog_id ON categories (business_id, catalog_id);

COMMENT ON COLUMN categories.catalog_id IS
  'Catálogo al que pertenece esta categoría. NOT NULL: toda categoría pertenece a un catálogo.';
