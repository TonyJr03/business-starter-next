-- =============================================================================
-- Migración: tabla business_faq_items
-- Fecha: 2026-04-30
--
-- Almacena las preguntas frecuentes de cada negocio.
-- Relación N:1 con businesses (un negocio puede tener muchos ítems FAQ).
--
-- Campos:
--   · question    TEXT     — texto de la pregunta
--   · answer      TEXT     — respuesta completa
--   · category    TEXT     — etiqueta de agrupación opcional (ej. "Pedidos")
--   · sort_order  INT      — orden de presentación
--   · is_active   BOOLEAN  — permite ocultar ítems sin eliminarlos
--
-- Convenciones heredadas del esquema base:
--   · UUID como PK
--   · updated_at via trigger
--   · RLS habilitado con lectura pública
-- =============================================================================

CREATE TABLE business_faq_items (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question     TEXT        NOT NULL,
  answer       TEXT        NOT NULL,
  category     TEXT,
  sort_order   INT         NOT NULL DEFAULT 0,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_faq_items_business_id ON business_faq_items (business_id);
CREATE INDEX idx_faq_items_active      ON business_faq_items (business_id, is_active, sort_order);

CREATE TRIGGER trg_faq_items_updated_at
  BEFORE UPDATE ON business_faq_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE business_faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_faq_items"
  ON business_faq_items FOR SELECT USING (true);

COMMENT ON TABLE business_faq_items IS
  'Preguntas frecuentes del negocio. Agrupables por categoría, ordenables por sort_order.';

COMMENT ON COLUMN business_faq_items.category IS
  'Etiqueta de agrupación visible en la UI (ej. "Pedidos", "Horarios"). NULL = sin grupo.';
