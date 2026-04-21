-- =============================================================================
-- Seed inicial: datos demo de Café La Esquina
-- Fecha: 2026-04-19
--
-- IMPORTANTE: datos de demostración para desarrollo local.
-- Reemplazar con datos reales del cliente antes de producción.
--
-- ─── UUID legend ─────────────────────────────────────────────────────────────
-- Los UUIDs son fijos para facilitar trazabilidad y reproducibilidad.
-- Se declaran como variables en el bloque DO $$ — escritos una sola vez.
--
--   Businesses:  10000000-0000-0000-0000-000000000001
--   Categories:  20000000-0000-0000-0000-00000000000X  (X = 1..3)
--   Products:    30000000-0000-0000-0000-00000000000X  (X = 1..10)
--   Promotions:  40000000-0000-0000-0000-00000000000X  (X = 1..4)
--
-- ─── Nota sobre IDs en src/data/ (fallback TypeScript) ───────────────────────
-- Los archivos src/data/*.ts usan IDs cortos legibles ('cat-1', 'prod-1', …)
-- que NO coinciden con los UUIDs de esta BD. Esto es intencional:
--   · src/data/ → fuente de fallback cuando Supabase no está disponible.
--   · Los servicios leen Supabase primero; los ID espacios nunca se mezclan.
--   Pendiente (sprint futuro): sincronizar IDs del fallback con los de BD,
--   o generar el fallback automáticamente desde un snapshot de la BD.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Limpiar en orden inverso al de dependencias (seguro en entorno de dev)
-- ---------------------------------------------------------------------------
TRUNCATE promotions, products, categories, businesses RESTART IDENTITY CASCADE;


-- =============================================================================
-- Inserts en bloque DO $$ con variables UUID
--
-- Ventajas frente a literales repetidos:
--   · UUID definido una sola vez → error tipográfico imposible
--   · Cross-references entre tablas legibles (p1, cat_1, biz)
--   · jsonb_build_array/object garantiza tipos correctos en JSONB
--   · Fácil de extender: añadir variable y usarla en N lugares
-- =============================================================================

DO $$
DECLARE
  -- ── Business ───────────────────────────────────────────────────────────────
  biz     CONSTANT UUID := '10000000-0000-0000-0000-000000000001';

  -- ── Categorías ────────────────────────────────────────────────────────────
  cat_1   CONSTANT UUID := '20000000-0000-0000-0000-000000000001';  -- Cafés
  cat_2   CONSTANT UUID := '20000000-0000-0000-0000-000000000002';  -- Bebidas frías
  cat_3   CONSTANT UUID := '20000000-0000-0000-0000-000000000003';  -- Bocados

  -- ── Productos ─────────────────────────────────────────────────────────────
  -- Cafés (cat_1)
  p1      CONSTANT UUID := '30000000-0000-0000-0000-000000000001';  -- Café Cubano
  p2      CONSTANT UUID := '30000000-0000-0000-0000-000000000002';  -- Cortadito
  p3      CONSTANT UUID := '30000000-0000-0000-0000-000000000003';  -- Café con Leche
  p4      CONSTANT UUID := '30000000-0000-0000-0000-000000000004';  -- Espresso Doble
  -- Bebidas frías (cat_2)
  p5      CONSTANT UUID := '30000000-0000-0000-0000-000000000005';  -- Jugo de Guayaba
  p6      CONSTANT UUID := '30000000-0000-0000-0000-000000000006';  -- Batido de Mango
  p7      CONSTANT UUID := '30000000-0000-0000-0000-000000000007';  -- Agua de Coco
  -- Bocados (cat_3)
  p8      CONSTANT UUID := '30000000-0000-0000-0000-000000000008';  -- Pastelito de Guayaba
  p9      CONSTANT UUID := '30000000-0000-0000-0000-000000000009';  -- Tostada con Mantequilla *
  p10     CONSTANT UUID := '30000000-0000-0000-0000-000000000010';  -- Croqueta de Jamón
  -- * p9 is_available=false (temporalmente agotada); referenciada en promo1.

  -- ── Promociones ───────────────────────────────────────────────────────────
  promo1  CONSTANT UUID := '40000000-0000-0000-0000-000000000001';  -- Desayuno Completo
  promo2  CONSTANT UUID := '40000000-0000-0000-0000-000000000002';  -- Happy Hour del Café
  promo3  CONSTANT UUID := '40000000-0000-0000-0000-000000000003';  -- Combo Amigos
  promo4  CONSTANT UUID := '40000000-0000-0000-0000-000000000004';  -- Tarde de Batidos

BEGIN

  -- ===========================================================================
  -- 1. Business: Café La Esquina
  -- ===========================================================================
  INSERT INTO businesses
    (id, slug, name, short_description, whatsapp, phone, email,
     address, city, country, social, hours)
  VALUES (
    biz,
    'cafe-la-esquina',
    'Café La Esquina',
    'Tu cafetería de confianza en La Habana. Café cubano, ambiente acogedor y los mejores sabores.',
    '+5350000000',
    '+5372000000',
    'contacto@cafelaesquina.cu',
    'Calle 23 esquina a L, Vedado',
    'La Habana',
    'Cuba',
    '{"instagram":"https://instagram.com/cafelaesquina","facebook":"https://facebook.com/cafelaesquina"}'::jsonb,
    '[
      {"day":"Lunes",     "open":"08:00","close":"22:00","isClosed":false},
      {"day":"Martes",    "open":"08:00","close":"22:00","isClosed":false},
      {"day":"Miércoles", "open":"08:00","close":"22:00","isClosed":false},
      {"day":"Jueves",    "open":"08:00","close":"22:00","isClosed":false},
      {"day":"Viernes",   "open":"08:00","close":"22:00","isClosed":false},
      {"day":"Sábado",    "open":"08:00","close":"22:00","isClosed":false},
      {"day":"Domingo",   "open":"09:00","close":"18:00","isClosed":false}
    ]'::jsonb
  );


  -- ===========================================================================
  -- 2. Categorías (cat_1 · cat_2 · cat_3)
  -- Equivalentes a src/data/categories.ts (fallback usa IDs cortos 'cat-1', etc.)
  -- ===========================================================================
  INSERT INTO categories
    (id, business_id, slug, name, description, sort_order, is_active)
  VALUES
    (cat_1, biz, 'cafes',         'Cafés',        'Café cubano, espresso, americano y más.',   1, true),
    (cat_2, biz, 'bebidas-frias', 'Bebidas frías', 'Jugos, batidos y refrescos naturales.',    2, true),
    (cat_3, biz, 'bocados',       'Bocados',       'Pastelitos, snacks y algo para acompañar.', 3, true);


  -- ===========================================================================
  -- 3. Productos (p1..p10)
  -- money_currency = 'CUP' en todos (mercado Cuba).
  -- Equivalentes a src/data/products.ts (fallback usa IDs cortos 'prod-1', etc.)
  --
  -- NOTA p9 (Tostada con Mantequilla): is_available = false → temporalmente
  --   agotada. Se mantiene referenciada porque promo1 (Desayuno Completo) la
  --   incluye en su combo. El service filtra is_available de forma independiente;
  --   la promo puede seguir activa aunque un componente esté fuera de stock.
  -- ===========================================================================
  INSERT INTO products
    (id, business_id, category_id, slug, name, description,
     money_amount, money_currency, is_available, is_featured, badge, sort_order)
  VALUES
    -- ── Cafés (cat_1) ────────────────────────────────────────────────────────
    (p1,  biz, cat_1, 'cafe-cubano',         'Café Cubano',
      'Nuestro café cubano tradicional, fuerte y aromático.',             25.00, 'CUP', true,  true,  'popular', 1),
    (p2,  biz, cat_1, 'cortadito',           'Cortadito',
      'Café cubano con un toque de leche suave.',                         30.00, 'CUP', true,  true,  NULL,      2),
    (p3,  biz, cat_1, 'cafe-con-leche',      'Café con Leche',
      'La combinación perfecta para comenzar el día.',                    40.00, 'CUP', true,  false, NULL,      3),
    (p4,  biz, cat_1, 'espresso-doble',      'Espresso Doble',
      'Concentrado e intenso, para los que no se conforman con poco.',    45.00, 'CUP', true,  false, 'new',     4),

    -- ── Bebidas frías (cat_2) ─────────────────────────────────────────────────
    (p5,  biz, cat_2, 'jugo-guayaba',        'Jugo de Guayaba',
      'Natural, fresco y bien cubano.',                                   35.00, 'CUP', true,  true,  'new',     1),
    (p6,  biz, cat_2, 'batido-mango',        'Batido de Mango',
      'Cremoso y dulce, hecho con mango fresco.',                         50.00, 'CUP', true,  false, NULL,      2),
    (p7,  biz, cat_2, 'agua-de-coco',        'Agua de Coco',
      'Refrescante y natural, directo del coco.',                         40.00, 'CUP', true,  false, NULL,      3),

    -- ── Bocados (cat_3) ───────────────────────────────────────────────────────
    (p8,  biz, cat_3, 'pastelito-guayaba',   'Pastelito de Guayaba',
      'Hojaldrado y relleno de guayaba, igual que en casa.',              20.00, 'CUP', true,  true,  'popular', 1),
    (p9,  biz, cat_3, 'tostada-mantequilla', 'Tostada con Mantequilla',
      'Pan tostado, crujiente y bien untado.',                            15.00, 'CUP', false, false, NULL,      2),
    (p10, biz, cat_3, 'croqueta-jamon',      'Croqueta de Jamón',
      'Crujiente por fuera, cremosa por dentro. Perfecta con el café.',   25.00, 'CUP', true,  false, NULL,      3);


  -- ===========================================================================
  -- 4. Promociones (promo1..promo4)
  --
  -- ─── Decisiones de modelado JSONB (temporales, Sprint 12) ─────────────────
  --
  -- A) Columnas product_ids / category_ids (nivel de fila)
  --    Arrays JSON de UUIDs que indican a qué entidades aplica la promoción.
  --    Propósito: filtrado eficiente en queries sin parsear el JSONB de rules.
  --    Ejemplo: "¿qué promos tienen a p1 en product_ids?" → índice GIN futuro.
  --    Estado TEMPORAL → se reemplazarán por tablas de relación en sprint futuro:
  --      · promotion_products(promotion_id UUID, product_id UUID)
  --      · promotion_categories(promotion_id UUID, category_id UUID)
  --    La migración será no destructiva: crear tablas, migrar datos del JSONB,
  --    eliminar columnas en migración posterior.
  --
  -- B) rules[].productIds / rules[].categoryIds (dentro del JSONB rules)
  --    Los mismos UUIDs embebidos dentro del objeto de regla.
  --    Propósito: evaluación de la lógica de descuento sin JOINs adicionales.
  --    La duplicación respecto a (A) es intencional en esta fase.
  --    INVARIANTE: deben ser idénticos a los de la columna product_ids /
  --    category_ids correspondiente.
  --
  -- C) Tipos de descuento presentes en este seed:
  --    · 'percentage' → value = % del 0 al 100
  --    · 'combo'      → value omitido; minItems requerido; precio especial implícito
  --    · 'bogo'       → value omitido; minItems = cantidad mínima para activar
  -- ===========================================================================
  INSERT INTO promotions
    (id, business_id, title, description, status, discount_label,
     starts_at, ends_at, rules, product_ids, category_ids, sort_order)
  VALUES

    -- ── promo1: Desayuno Completo ─────────────────────────────────────────────
    -- Combo de tres productos: p1 (Café Cubano) + p5 (Jugo de Guayaba) +
    -- p9 (Tostada con Mantequilla). p9 está agotada temporalmente pero
    -- permanece referenciada para preservar la intención del combo.
    (
      promo1, biz,
      'Desayuno Completo',
      'Café cubano + tostada + jugo del día por un precio especial. Disponible de lunes a viernes de 8:00 a 11:00.',
      'active', '20% OFF',
      '2026-04-01 00:00:00+00', '2026-04-30 23:59:59+00',
      jsonb_build_array(
        jsonb_build_object(
          'type',       'percentage',
          'value',      20,
          'minItems',   3,
          'productIds', jsonb_build_array(p1::text, p5::text, p9::text),
          'description','20% de descuento al pedir café cubano, jugo del día y tostada juntos.'
        )
      ),
      jsonb_build_array(p1::text, p5::text, p9::text),  -- Café Cubano · Jugo de Guayaba · Tostada
      NULL,
      1
    ),

    -- ── promo2: Happy Hour del Café ──────────────────────────────────────────
    -- % sobre toda la categoría Cafés. Sin restricción de productos individuales.
    (
      promo2, biz,
      'Happy Hour del Café',
      'Todos los cafés a mitad de precio de 3:00 PM a 5:00 PM.',
      'active', '50% OFF',
      '2026-04-01 00:00:00+00', '2026-04-30 23:59:59+00',
      jsonb_build_array(
        jsonb_build_object(
          'type',        'percentage',
          'value',       50,
          'categoryIds', jsonb_build_array(cat_1::text),
          'description', 'Mitad de precio en todos los cafés durante el happy hour.'
        )
      ),
      NULL,
      jsonb_build_array(cat_1::text),  -- Categoría: Cafés
      2
    ),

    -- ── promo3: Combo Amigos ─────────────────────────────────────────────────
    -- Precio especial al pedir ≥4 ítems entre p1 y p8.
    -- Sin fechas → permanente mientras status = 'active'.
    (
      promo3, biz,
      'Combo Amigos',
      'Dos cafés cubanos + dos pastelitos de guayaba por un precio especial. Ideal para compartir.',
      'active', 'Combo',
      NULL, NULL,
      jsonb_build_array(
        jsonb_build_object(
          'type',       'combo',
          'minItems',   4,
          'productIds', jsonb_build_array(p1::text, p8::text),
          'description','Precio especial al pedir 2 cafés cubanos y 2 pastelitos de guayaba.'
        )
      ),
      jsonb_build_array(p1::text, p8::text),  -- Café Cubano · Pastelito de Guayaba
      NULL,
      3
    ),

    -- ── promo4: Tarde de Batidos ─────────────────────────────────────────────
    -- BOGO en categoría Bebidas frías. Status 'paused' → visible en UI
    -- pero marcada como pausada; el service no la aplica en pedidos.
    (
      promo4, biz,
      'Tarde de Batidos',
      'Lleva dos batidos y paga uno. De 2:00 PM a 6:00 PM, de martes a jueves.',
      'paused', '2×1',
      '2026-04-15 00:00:00+00', '2026-05-15 23:59:59+00',
      jsonb_build_array(
        jsonb_build_object(
          'type',        'bogo',
          'minItems',    2,
          'categoryIds', jsonb_build_array(cat_2::text),
          'description', 'Segundo batido gratis al comprar el primero en el horario indicado.'
        )
      ),
      NULL,
      jsonb_build_array(cat_2::text),  -- Categoría: Bebidas frías
      4
    );

END $$;
