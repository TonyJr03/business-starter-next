-- =============================================================================
-- Migración: tablas gallery_albums + gallery_photos
-- Fecha: 2026-04-30
--
-- Sistema de galería con álbumes para el negocio.
-- Estructura:
--   · gallery_albums  — agrupa fotos bajo un nombre y descripción (N por negocio)
--   · gallery_photos  — fotos individuales, cada una ligada a un álbum
--
-- Reglas de dominio:
--   · Toda foto pertenece a exactamente un álbum (NOT NULL).
--   · El filtro "Todas" se construye en el servidor uniendo todas las fotos.
--   · Al eliminar un álbum se eliminan en cascada sus fotos.
--
-- Convenciones heredadas del esquema base:
--   · UUID como PK
--   · updated_at via trigger
--   · RLS habilitado con lectura pública
-- =============================================================================


-- =============================================================================
-- Tabla: gallery_albums
-- =============================================================================
CREATE TABLE gallery_albums (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug             TEXT        NOT NULL,
  name             TEXT        NOT NULL,
  description      TEXT,
  cover_image_url  TEXT,
  sort_order       INT         NOT NULL DEFAULT 0,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (business_id, slug)
);

CREATE INDEX idx_gallery_albums_business_id ON gallery_albums (business_id);
CREATE INDEX idx_gallery_albums_active      ON gallery_albums (business_id, is_active, sort_order);

CREATE TRIGGER trg_gallery_albums_updated_at
  BEFORE UPDATE ON gallery_albums
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_gallery_albums"
  ON gallery_albums FOR SELECT USING (true);

COMMENT ON TABLE gallery_albums IS
  'Álbumes fotográficos del negocio. Agrupan gallery_photos bajo un nombre y descripción.';


-- =============================================================================
-- Tabla: gallery_photos
-- =============================================================================
CREATE TABLE gallery_photos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  album_id     UUID        NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url    TEXT        NOT NULL,
  alt          TEXT        NOT NULL,
  caption      TEXT,
  sort_order   INT         NOT NULL DEFAULT 0,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_photos_business_id ON gallery_photos (business_id);
CREATE INDEX idx_gallery_photos_album_id    ON gallery_photos (album_id, is_active, sort_order);

CREATE TRIGGER trg_gallery_photos_updated_at
  BEFORE UPDATE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_gallery_photos"
  ON gallery_photos FOR SELECT USING (true);

COMMENT ON TABLE gallery_photos IS
  'Fotos individuales de la galería. Cada foto pertenece a un gallery_album.';

COMMENT ON COLUMN gallery_photos.alt IS
  'Texto alternativo accesible. Requerido para accesibilidad e indexación.';
