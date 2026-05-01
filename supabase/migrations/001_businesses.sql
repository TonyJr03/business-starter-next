-- =============================================================================
-- 001_businesses.sql
-- Tabla principal de negocios con todos los campos consolidados.
-- Reemplaza los fragmentos dispersos en múltiples migraciones anteriores.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: función para actualizar updated_at automáticamente
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- Tabla: businesses
-- Representa el negocio raíz. Diseñada para escalar a multi-tenant.
-- =============================================================================
CREATE TABLE businesses (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT        NOT NULL UNIQUE,
  name              TEXT        NOT NULL,
  short_description TEXT,
  whatsapp          TEXT,
  phone             TEXT,
  email             TEXT,
  address           TEXT,
  city              TEXT,
  country           TEXT,
  social            JSONB       NOT NULL DEFAULT '{}',
  hours             JSONB       NOT NULL DEFAULT '[]',
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  branding          JSONB       NOT NULL DEFAULT '{}',
  modules           JSONB       NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "businesses_select_public"
  ON businesses FOR SELECT USING (true);

-- Solo usuarios autenticados pueden actualizar (no insert/delete desde la API)
CREATE POLICY "businesses_update_admin"
  ON businesses FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);
