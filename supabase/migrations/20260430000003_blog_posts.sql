-- =============================================================================
-- Migración: tabla business_blog_posts
-- Fecha: 2026-04-30
--
-- Artículos de blog asociados a un negocio.
--
-- Reglas de dominio:
--   · Un slug es único dentro de un mismo negocio (UNIQUE business_id + slug).
--   · El cuerpo del artículo se almacena como array de párrafos (TEXT[]).
--   · Solo los artículos con is_published = true se devuelven al cliente.
--   · Los tags se guardan como TEXT[] y son opcionales.
--   · El ordenamiento por defecto es descendente por published_at.
--
-- Convenciones heredadas del esquema base:
--   · UUID como PK
--   · updated_at via trigger
--   · RLS habilitado con lectura pública
-- =============================================================================


CREATE TABLE business_blog_posts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug          TEXT        NOT NULL,
  title         TEXT        NOT NULL,
  summary       TEXT        NOT NULL,
  body          TEXT[]      NOT NULL DEFAULT '{}',
  published_at  DATE        NOT NULL,
  author        TEXT,
  tags          TEXT[],
  is_published  BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (business_id, slug)
);

CREATE INDEX idx_blog_posts_business_id ON business_blog_posts (business_id);
CREATE INDEX idx_blog_posts_published   ON business_blog_posts (business_id, is_published, published_at DESC);

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON business_blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE business_blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_blog_posts"
  ON business_blog_posts FOR SELECT USING (true);

COMMENT ON TABLE business_blog_posts IS
  'Artículos de blog por negocio. El body se guarda como array de párrafos.';

COMMENT ON COLUMN business_blog_posts.body IS
  'Cuerpo del artículo como array de párrafos de texto. Cada elemento se renderiza como <p>.';

COMMENT ON COLUMN business_blog_posts.tags IS
  'Etiquetas del artículo. Array de strings en minúsculas sin espacios.';
