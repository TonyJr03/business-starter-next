-- =============================================================================
-- Migración: tabla business_about
-- Fecha: 2026-04-30
--
-- Almacena el contenido editorial de la página "Sobre Nosotros" de cada negocio.
-- Relación 1:1 con businesses (UNIQUE en business_id).
--
-- Campos:
--   · story           TEXT[]  — párrafos de la historia del negocio
--   · mission         TEXT    — declaración de misión o propuesta de valor
--   · differentiators JSONB   — array de { icon?, title, description }
--   · team_image_url  TEXT    — foto del equipo o del local
--
-- Convenciones heredadas del esquema base:
--   · UUID como PK
--   · updated_at via trigger
--   · RLS habilitado con lectura pública
-- =============================================================================

CREATE TABLE business_about (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID        NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  story             TEXT[]      NOT NULL DEFAULT '{}',
  mission           TEXT,
  differentiators   JSONB,
  team_image_url    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_about_business_id ON business_about (business_id);

CREATE TRIGGER trg_business_about_updated_at
  BEFORE UPDATE ON business_about
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE business_about ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_business_about"
  ON business_about FOR SELECT USING (true);

COMMENT ON TABLE business_about IS
  'Contenido editorial de la página Sobre Nosotros. Relación 1:1 con businesses.';

COMMENT ON COLUMN business_about.story IS
  'Array de párrafos que narran la historia del negocio. Orden preservado.';

COMMENT ON COLUMN business_about.differentiators IS
  'Array JSONB de { icon?: string, title: string, description: string }. Propuesta de valor.';

COMMENT ON COLUMN business_about.team_image_url IS
  'URL de imagen del equipo o del local. Mostrada en la sección Historia.';
