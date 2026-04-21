-- =============================================================================
-- Migración inicial: esquema base del dominio business-starter
-- Fecha: 2026-04-19
--
-- Tablas: businesses · categories · products · promotions
-- Convenciones:
--   · UUID como PK (gen_random_uuid)
--   · snake_case para todos los identificadores SQL
--   · business_id en todas las tablas de dominio → multi-tenant listo
--   · JSONB para estructuras variables (tags, rules, product_ids, category_ids)
--   · updated_at gestionado por trigger automático
--   · RLS habilitado con política de lectura pública para desarrollo local
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
-- Representa el negocio raíz. En este starter hay uno solo, pero el esquema
-- está diseñado para escalar a multi-tenant sin cambios de estructura.
-- =============================================================================
CREATE TABLE businesses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,   -- ej. 'cafe-la-esquina'
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- Tabla: categories
-- Agrupa productos bajo un criterio del negocio (ej. 'Cafés', 'Postres').
-- =============================================================================
CREATE TABLE categories (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug         TEXT        NOT NULL,          -- único dentro del negocio
  name         TEXT        NOT NULL,
  description  TEXT,
  image_url    TEXT,
  sort_order   INT         NOT NULL DEFAULT 0,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (business_id, slug)
);

-- Índices de acceso frecuente
CREATE INDEX idx_categories_business_id ON categories (business_id);
CREATE INDEX idx_categories_is_active   ON categories (business_id, is_active);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- Tabla: products
-- Ítem del catálogo: producto, plato, servicio, etc.
--
-- Precio representado como (money_amount, money_currency) para alinearse con
-- el tipo Money del dominio TypeScript:
--   { amount: number; currency: string }
-- =============================================================================
CREATE TABLE products (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID           NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id      UUID           NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug             TEXT           NOT NULL,   -- único dentro del negocio
  name             TEXT           NOT NULL,
  description      TEXT,
  money_amount     NUMERIC(12, 2) NOT NULL,
  money_currency   TEXT           NOT NULL DEFAULT 'CUP',  -- ISO 4217
  is_available     BOOLEAN        NOT NULL DEFAULT true,
  is_featured      BOOLEAN        NOT NULL DEFAULT false,
  badge            TEXT,                      -- 'new' | 'popular' | 'offer'
  -- tags: array de objetos { id, label, color? } — ej. [{"id":"v","label":"Vegano"}]
  tags             JSONB,
  image_url        TEXT,
  sort_order       INT            NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),

  UNIQUE (business_id, slug)
);

-- Índices de acceso frecuente
CREATE INDEX idx_products_business_id   ON products (business_id);
CREATE INDEX idx_products_category_id   ON products (business_id, category_id);
CREATE INDEX idx_products_is_available  ON products (business_id, is_available);
CREATE INDEX idx_products_is_featured   ON products (business_id, is_featured);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- Tabla: promotions
-- Oferta especial, campaña de descuento o bundle del negocio.
--
-- Estado del ciclo de vida (status):
--   upcoming · active · expired · paused
--
-- Las reglas (rules) y las referencias a productos/categorías se almacenan
-- como JSONB en esta fase inicial para alinearse con el dominio TypeScript
-- sin añadir tablas de relación todavía:
--   rules        → PromotionRule[]
--   product_ids  → string[]  (IDs locales; se reemplazarán por UUIDs al migrar data)
--   category_ids → string[]
-- =============================================================================
CREATE TABLE promotions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  description     TEXT,
  status          TEXT        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('upcoming', 'active', 'expired', 'paused')),
  discount_label  TEXT,                      -- ej. '20% OFF', '2×1'
  image_url       TEXT,
  starts_at       TIMESTAMPTZ,               -- inicio de la vigencia
  ends_at         TIMESTAMPTZ,               -- fin de la vigencia
  -- rules: PromotionRule[] — tipo, valor, condiciones
  rules           JSONB,
  -- referencias a entidades del catálogo
  product_ids     JSONB,                     -- string[]
  category_ids    JSONB,                     -- string[]
  sort_order      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de acceso frecuente
CREATE INDEX idx_promotions_business_id ON promotions (business_id);
CREATE INDEX idx_promotions_status      ON promotions (business_id, status);
CREATE INDEX idx_promotions_dates       ON promotions (business_id, starts_at, ends_at);

CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- RLS (Row Level Security)
-- Se habilita en todas las tablas. Por ahora solo política de lectura pública
-- para que el cliente anon pueda leer datos en desarrollo local.
-- Políticas de escritura (INSERT/UPDATE/DELETE) se añadirán cuando se
-- implemente autenticación de admin.
-- =============================================================================
ALTER TABLE businesses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions  ENABLE ROW LEVEL SECURITY;

-- Lectura pública anónima (desarrollo y catálogo público)
CREATE POLICY "lectura_publica_businesses"
  ON businesses FOR SELECT USING (true);

CREATE POLICY "lectura_publica_categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "lectura_publica_products"
  ON products FOR SELECT USING (true);

CREATE POLICY "lectura_publica_promotions"
  ON promotions FOR SELECT USING (true);
