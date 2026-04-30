-- =============================================================================
-- Seed inicial: datos demo de Café La Esquina
-- Fecha: 2026-04-19
--
-- IMPORTANTE: datos de demostración para desarrollo local.
-- Reemplazar con datos reales del cliente antes de producción.
--
-- ─── UUID legend ─────────────────────────────────────────────────────────────
-- Los UUIDs son fijos para facilitar trazabilidad y reproducibilidad.
-- Formato v4 válido (RFC 4122): tercer grupo '4xxx', cuarto grupo '8xxx'.
-- Se declaran como variables en el bloque DO $$ — escritos una sola vez.
--
--   Businesses:  10000000-0000-4000-8000-000000000001
--   Categories:  20000000-0000-4000-8000-00000000000X  (X = 1..3)
--   Products:    30000000-0000-4000-8000-00000000000X  (X = 1..10)
--   Promotions:  40000000-0000-4000-8000-00000000000X  (X = 1..4)
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
TRUNCATE business_blog_posts, gallery_photos, gallery_albums, business_faq_items, business_about, promotions, products, categories, catalogs, businesses RESTART IDENTITY CASCADE;


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
  -- UUIDs usan versión 4 (tercer grupo '4xxx') y variante Leach-Salz (cuarto
  -- grupo '8xxx') para ser RFC 4122 válidos y pasar la validación de Zod.
  biz     CONSTANT UUID := '10000000-0000-4000-8000-000000000001';

  -- ── Catálogos ────────────────────────────────────────────────────────────
  cat_main  CONSTANT UUID := '50000000-0000-4000-8000-000000000001';  -- Cafetería
  cat_dulce CONSTANT UUID := '50000000-0000-4000-8000-000000000002';  -- Dulcería

  -- ── Categorías ────────────────────────────────────────────────────────────
  -- Cafetería (cat_main)
  cat_1   CONSTANT UUID := '20000000-0000-4000-8000-000000000001';  -- Cafés
  cat_2   CONSTANT UUID := '20000000-0000-4000-8000-000000000002';  -- Bebidas frías
  cat_3   CONSTANT UUID := '20000000-0000-4000-8000-000000000003';  -- Bocados
  -- Dulcería (cat_dulce)
  cat_4   CONSTANT UUID := '20000000-0000-4000-8000-000000000004';  -- Tortas
  cat_5   CONSTANT UUID := '20000000-0000-4000-8000-000000000005';  -- Bollería
  cat_6   CONSTANT UUID := '20000000-0000-4000-8000-000000000006';  -- Postres fríos

  -- ── Productos ─────────────────────────────────────────────────────────────
  -- Cafés (cat_1)
  p1      CONSTANT UUID := '30000000-0000-4000-8000-000000000001';  -- Café Cubano
  p2      CONSTANT UUID := '30000000-0000-4000-8000-000000000002';  -- Cortadito
  p3      CONSTANT UUID := '30000000-0000-4000-8000-000000000003';  -- Café con Leche
  p4      CONSTANT UUID := '30000000-0000-4000-8000-000000000004';  -- Espresso Doble
  -- Bebidas frías (cat_2)
  p5      CONSTANT UUID := '30000000-0000-4000-8000-000000000005';  -- Jugo de Guayaba
  p6      CONSTANT UUID := '30000000-0000-4000-8000-000000000006';  -- Batido de Mango
  p7      CONSTANT UUID := '30000000-0000-4000-8000-000000000007';  -- Agua de Coco
  -- Bocados (cat_3)
  p8      CONSTANT UUID := '30000000-0000-4000-8000-000000000008';  -- Pastelito de Guayaba
  p9      CONSTANT UUID := '30000000-0000-4000-8000-000000000009';  -- Tostada con Mantequilla *
  p10     CONSTANT UUID := '30000000-0000-4000-8000-000000000010';  -- Croqueta de Jamón
  -- * p9 is_available=false (temporalmente agotada); referenciada en promo1.
  -- Tortas (cat_4)
  p11     CONSTANT UUID := '30000000-0000-4000-8000-000000000011';  -- Torta de Tres Leches
  p12     CONSTANT UUID := '30000000-0000-4000-8000-000000000012';  -- Torta de Chocolate
  p13     CONSTANT UUID := '30000000-0000-4000-8000-000000000013';  -- Torta de Zanahoria
  -- Bollería (cat_5)
  p14     CONSTANT UUID := '30000000-0000-4000-8000-000000000014';  -- Pan de Guayaba
  p15     CONSTANT UUID := '30000000-0000-4000-8000-000000000015';  -- Croissant de Mantequilla
  p16     CONSTANT UUID := '30000000-0000-4000-8000-000000000016';  -- Donut Glaseado
  -- Postres fríos (cat_6)
  p17     CONSTANT UUID := '30000000-0000-4000-8000-000000000017';  -- Helado de Coco
  p18     CONSTANT UUID := '30000000-0000-4000-8000-000000000018';  -- Flan de Leche

  -- ── Promociones ───────────────────────────────────────────────────────────
  promo1  CONSTANT UUID := '40000000-0000-4000-8000-000000000001';  -- Desayuno Completo
  promo2  CONSTANT UUID := '40000000-0000-4000-8000-000000000002';  -- Happy Hour del Café
  promo3  CONSTANT UUID := '40000000-0000-4000-8000-000000000003';  -- Combo Amigos
  promo4  CONSTANT UUID := '40000000-0000-4000-8000-000000000004';  -- Tarde de Batidos

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
  -- 2. Catálogos (cat_main)
  -- Un solo catálogo para el negocio demo. Múltiples catálogos se añaden
  -- insertando más filas; la UI se adapta automáticamente (dropdown nav, etc.).
  -- ===========================================================================
  INSERT INTO catalogs
    (id, business_id, slug, name, description, image_url, sort_order, is_active)
  VALUES
    (cat_main,  biz, 'cafeteria', 'Cafetería',  'El menú completo del café: bebidas, bocados y más.',  NULL, 1, true),
    (cat_dulce, biz, 'dulceria',  'Dulcería',   'Tortas, bollería y postres fríos artesanales.', NULL, 2, true);


  -- ===========================================================================
  -- 3. Categorías (cat_1 · cat_2 · cat_3)
  -- Equivalentes a src/data/categories.ts (fallback usa IDs cortos 'cat-1', etc.)
  -- ===========================================================================
  INSERT INTO categories
    (id, business_id, catalog_id, slug, name, description, sort_order, is_active)
  VALUES
    (cat_1, biz, cat_main,  'cafes',         'Cafés',          'Café cubano, espresso, americano y más.',    1, true),
    (cat_2, biz, cat_main,  'bebidas-frias',  'Bebidas frías',  'Jugos, batidos y refrescos naturales.',      2, true),
    (cat_3, biz, cat_main,  'bocados',        'Bocados',         'Pastelitos, snacks y algo para acompañar.',  3, true),
    (cat_4, biz, cat_dulce, 'tortas',         'Tortas',          'Tortas caseras horneadas cada mañana.',      1, true),
    (cat_5, biz, cat_dulce, 'bolleria',       'Bollería',        'Pan dulce, croissants y donas artesanales.', 2, true),
    (cat_6, biz, cat_dulce, 'postres-frios',  'Postres fríos',  'Helados, flanes y cremitas bien frías.',     3, true);


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
     money_amount, money_currency, is_available, is_featured, badge, sort_order, image_url)
  VALUES
    -- ── Cafés (cat_1) ────────────────────────────────────────────────────────
    (p1,  biz, cat_1, 'cafe-cubano',         'Café Cubano',
      'Nuestro café cubano tradicional, fuerte y aromático.',             25.00, 'CUP', true,  true,  'popular', 1, 'https://picsum.photos/seed/cafe-cubano/600/450'),
    (p2,  biz, cat_1, 'cortadito',           'Cortadito',
      'Café cubano con un toque de leche suave.',                         30.00, 'CUP', true,  true,  NULL,      2, 'https://picsum.photos/seed/cortadito/600/450'),
    (p3,  biz, cat_1, 'cafe-con-leche',      'Café con Leche',
      'La combinación perfecta para comenzar el día.',                    40.00, 'CUP', true,  false, NULL,      3, 'https://picsum.photos/seed/cafe-con-leche/600/450'),
    (p4,  biz, cat_1, 'espresso-doble',      'Espresso Doble',
      'Concentrado e intenso, para los que no se conforman con poco.',    45.00, 'CUP', true,  false, 'new',     4, 'https://picsum.photos/seed/espresso-doble/600/450'),

    -- ── Bebidas frías (cat_2) ─────────────────────────────────────────────────
    (p5,  biz, cat_2, 'jugo-guayaba',        'Jugo de Guayaba',
      'Natural, fresco y bien cubano.',                                   35.00, 'CUP', true,  true,  'new',     1, 'https://picsum.photos/seed/jugo-guayaba/600/450'),
    (p6,  biz, cat_2, 'batido-mango',        'Batido de Mango',
      'Cremoso y dulce, hecho con mango fresco.',                         50.00, 'CUP', true,  false, NULL,      2, 'https://picsum.photos/seed/batido-mango/600/450'),
    (p7,  biz, cat_2, 'agua-de-coco',        'Agua de Coco',
      'Refrescante y natural, directo del coco.',                         40.00, 'CUP', true,  false, NULL,      3, 'https://picsum.photos/seed/agua-de-coco/600/450'),

    -- ── Bocados (cat_3) ───────────────────────────────────────────────────────
    (p8,  biz, cat_3, 'pastelito-guayaba',   'Pastelito de Guayaba',
      'Hojaldrado y relleno de guayaba, igual que en casa.',              20.00, 'CUP', true,  true,  'popular', 1, 'https://picsum.photos/seed/pastelito-guayaba/600/450'),
    (p9,  biz, cat_3, 'tostada-mantequilla', 'Tostada con Mantequilla',
      'Pan tostado, crujiente y bien untado.',                            15.00, 'CUP', false, false, NULL,      2, 'https://picsum.photos/seed/tostada-mantequilla/600/450'),
    (p10, biz, cat_3, 'croqueta-jamon',      'Croqueta de Jamón',
      'Crujiente por fuera, cremosa por dentro. Perfecta con el café.',   25.00, 'CUP', true,  false, NULL,      3, 'https://picsum.photos/seed/croqueta-jamon/600/450'),

    -- ── Tortas (cat_4) ────────────────────────────────────────────────────────
    (p11, biz, cat_4, 'torta-tres-leches',   'Torta de Tres Leches',
      'Esponjosa, húmeda y bañada en tres tipos de leche. La favorita.',  85.00, 'CUP', true,  true,  'popular', 1, 'https://picsum.photos/seed/torta-tres-leches/600/450'),
    (p12, biz, cat_4, 'torta-chocolate',     'Torta de Chocolate',
      'Dos pisos de bizcocho intenso con ganache de chocolate cubano.',   90.00, 'CUP', true,  true,  NULL,      2, 'https://picsum.photos/seed/torta-chocolate/600/450'),
    (p13, biz, cat_4, 'torta-zanahoria',     'Torta de Zanahoria',
      'Suave y especiada, con cobertura de queso crema.',                 80.00, 'CUP', true,  false, 'new',     3, 'https://picsum.photos/seed/torta-zanahoria/600/450'),

    -- ── Bollería (cat_5) ─────────────────────────────────────────────────────
    (p14, biz, cat_5, 'pan-guayaba',         'Pan de Guayaba',
      'Suave por dentro, hojaldrado por fuera y relleno de guayaba.',     18.00, 'CUP', true,  true,  'popular', 1, 'https://picsum.photos/seed/pan-guayaba/600/450'),
    (p15, biz, cat_5, 'croissant-mantequilla','Croissant de Mantequilla',
      'Capas doradas y crujientes, elaborado con mantequilla real.',      22.00, 'CUP', true,  false, NULL,      2, 'https://picsum.photos/seed/croissant-mantequilla/600/450'),
    (p16, biz, cat_5, 'donut-glaseado',      'Donut Glaseado',
      'Esponjoso, azucarado y con glaseado de colores. Para todos.',      15.00, 'CUP', true,  false, 'new',     3, 'https://picsum.photos/seed/donut-glaseado/600/450'),

    -- ── Postres fríos (cat_6) ─────────────────────────────────────────────────
    (p17, biz, cat_6, 'helado-coco',         'Helado de Coco',
      'Cremoso, natural y servido en copa. Sabor caribeño puro.',         30.00, 'CUP', true,  true,  NULL,      1, 'https://picsum.photos/seed/helado-coco/600/450'),
    (p18, biz, cat_6, 'flan-leche',          'Flan de Leche',
      'El clásico cubano: suave, tembloroso y con caramelo de verdad.',   25.00, 'CUP', true,  false, NULL,      2, 'https://picsum.photos/seed/flan-leche/600/450');


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
    (id, business_id, title, description, image_url, status, discount_label,
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
      'https://picsum.photos/seed/desayuno/600/450',
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
      'https://picsum.photos/seed/cafe/600/450',
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
      'https://picsum.photos/seed/combo/600/450',
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
      'https://picsum.photos/seed/batidos/600/450',
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

  -- ===========================================================================
  -- 6. About: contenido editorial de Café La Esquina
  -- ===========================================================================
  INSERT INTO business_about
    (business_id, story, mission, differentiators, team_image_url)
  VALUES (
    biz,
    ARRAY[
      'Café La Esquina nació en 2015 en el corazón del Vedado, ocupando el local que durante décadas fue la bodega de la familia Martínez. Lo que empezó como un sueño de tres amigos con pasión por el café cubano se convirtió en el punto de encuentro del barrio.',
      'Hoy, más de diez años después, seguimos tostando nuestro café en pequeños lotes, seleccionando granos de las mejores fincas de la Sierra Maestra y preparando cada taza con el mismo cuidado del primer día.',
      'Más allá del café, somos un espacio donde los vecinos se detienen a conversar, los estudiantes encuentran su rincón favorito y las familias celebran los momentos del día a día. Eso es lo que nos hace especiales: no solo el café, sino la esquina que habitamos.'
    ],
    'Ofrecer el mejor café cubano de La Habana en un ambiente auténtico, donde cada visita se sienta como llegar a casa.',
    jsonb_build_array(
      jsonb_build_object(
        'icon',        'coffee',
        'title',       'Café de origen cubano',
        'description', 'Trabajamos directamente con fincas de la Sierra Maestra. Lotes pequeños, tostado propio, frescura garantizada en cada taza.'
      ),
      jsonb_build_object(
        'icon',        'heart',
        'title',       'Hecho con cariño',
        'description', 'Cada producto sale de nuestra cocina: desde los pastelitos de guayaba hasta las tortas del día. Sin intermediarios, sin conservantes.'
      ),
      jsonb_build_object(
        'icon',        'map-pin',
        'title',       'El corazón del Vedado',
        'description', 'Llevamos más de diez años siendo parte del barrio. Conocemos a nuestros clientes por su nombre y ellos conocen el nuestro.'
      )
    ),
    'https://picsum.photos/seed/cafe-equipo/800/600'
  );

  -- ===========================================================================
  -- 7. FAQ: preguntas frecuentes de Café La Esquina
  -- Categorías: 'Pedidos', 'Horarios y visitas', 'Productos', 'Pagos'
  -- ===========================================================================
  INSERT INTO business_faq_items
    (id, business_id, question, answer, category, sort_order)
  VALUES

    -- ── Pedidos ──────────────────────────────────────────────────────────────
    (
      '60000000-0000-4000-8000-000000000001', biz,
      '¿Cómo puedo hacer un pedido?',
      'La forma más rápida es escribirnos directamente por WhatsApp. Indícanos qué producto te interesa, la cantidad y si lo recogerás en el local o necesitas envío. Respondemos en minutos.',
      'Pedidos', 1
    ),
    (
      '60000000-0000-4000-8000-000000000002', biz,
      '¿Hacen pedidos para llevar?',
      'Sí, todos nuestros productos están disponibles para llevar. Puedes ordenarlos por WhatsApp con anticipación o pedirlos directamente en el mostrador al llegar.',
      'Pedidos', 2
    ),
    (
      '60000000-0000-4000-8000-000000000003', biz,
      '¿Realizan entregas a domicilio?',
      'Por el momento no contamos con servicio de entrega propia. Sin embargo, trabajamos con mensajeros de confianza del barrio. Consúltanos por WhatsApp y te orientamos según tu ubicación.',
      'Pedidos', 3
    ),
    (
      '60000000-0000-4000-8000-000000000004', biz,
      '¿Con cuánta anticipación debo hacer un pedido grande?',
      'Para pedidos de más de 10 personas o productos de dulcería elaborados (tortas, postres), recomendamos avisarnos con al menos 24 horas de antelación. Para pedidos habituales, no hace falta anticipación.',
      'Pedidos', 4
    ),

    -- ── Horarios y visitas ────────────────────────────────────────────────────
    (
      '60000000-0000-4000-8000-000000000005', biz,
      '¿Cuál es el horario de atención?',
      'Abrimos de lunes a domingo de 8:00 AM a 10:00 PM. Los domingos cerramos a las 8:00 PM. Puedes consultar el horario completo en nuestra sección de Contacto.',
      'Horarios y visitas', 1
    ),
    (
      '60000000-0000-4000-8000-000000000006', biz,
      '¿Dónde están ubicados?',
      'Estamos en Calle 23 esquina a L, en el Vedado, La Habana. Somos el local de la esquina con la fachada marrón y la pizarra de ofertas en la puerta.',
      'Horarios y visitas', 2
    ),
    (
      '60000000-0000-4000-8000-000000000007', biz,
      '¿Tienen mesas disponibles para sentarse?',
      'Sí, contamos con un pequeño salón interior con 8 mesas y una terraza exterior con 4 mesas adicionales. En horas pico (mediodía y merienda) puede haber espera breve.',
      'Horarios y visitas', 3
    ),

    -- ── Productos ────────────────────────────────────────────────────────────
    (
      '60000000-0000-4000-8000-000000000008', biz,
      '¿El café es cubano de verdad?',
      'Absolutamente. Trabajamos con granos seleccionados de la Sierra Maestra, los tostamos en pequeños lotes nosotros mismos y lo preparamos al estilo tradicional cubano: concentrado, aromático y sin aditivos.',
      'Productos', 1
    ),
    (
      '60000000-0000-4000-8000-000000000009', biz,
      '¿Los productos de dulcería son elaboración propia?',
      'Sí. Todas las tortas, bollería y postres fríos son de producción propia. No vendemos productos de fábrica ni con conservantes. Por eso nuestra disponibilidad puede variar según el día.',
      'Productos', 2
    ),
    (
      '60000000-0000-4000-8000-000000000010', biz,
      '¿Tienen opciones sin azúcar o para personas con restricciones alimentarias?',
      'Contamos con algunas opciones bajas en azúcar bajo pedido previo. Si tienes alguna alergia o restricción alimentaria, escríbenos por WhatsApp antes de tu visita y nos adaptamos en la medida de lo posible.',
      'Productos', 3
    ),

    -- ── Pagos ────────────────────────────────────────────────────────────────
    (
      '60000000-0000-4000-8000-000000000011', biz,
      '¿Qué formas de pago aceptan?',
      'Aceptamos efectivo en CUP y transferencias bancarias. También puedes pagar con tarjeta magnética en el local. Para pedidos por WhatsApp, coordinamos el pago al momento de la entrega o recogida.',
      'Pagos', 1
    ),
    (
      '60000000-0000-4000-8000-000000000012', biz,
      '¿Puedo pagar por adelantado para asegurar mi pedido?',
      'Para pedidos grandes o con mucha anticipación, sí aceptamos un pago parcial por adelantado como confirmación. Te indicaremos los detalles al coordinar tu pedido por WhatsApp.',
      'Pagos', 2
    );

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 8. GALERÍA: álbumes y fotos de Café La Esquina
  --    Álbumes: a1=Nuestro espacio, a2=Productos, a3=Equipo
  --    Fotos:   4 por álbum = 12 en total
  --    IDs álbum:  70000000-0000-4000-8000-000000000001..3
  --    IDs fotos:  70000000-0000-4000-8000-000000000101..112
  -- ═══════════════════════════════════════════════════════════════════════════

  -- 8a. Álbumes
  INSERT INTO gallery_albums (id, business_id, slug, name, description, cover_image_url, sort_order)
  VALUES
    (
      '70000000-0000-4000-8000-000000000001', biz,
      'nuestro-espacio',
      'Nuestro Espacio',
      'El ambiente acogedor de Café La Esquina.',
      'https://picsum.photos/seed/cafe-espacio-cover/800/600',
      1
    ),
    (
      '70000000-0000-4000-8000-000000000002', biz,
      'productos',
      'Productos',
      'Cafés, pasteles y bebidas artesanales.',
      'https://picsum.photos/seed/cafe-productos-cover/800/600',
      2
    ),
    (
      '70000000-0000-4000-8000-000000000003', biz,
      'equipo',
      'Nuestro Equipo',
      'Las personas detrás de cada taza.',
      'https://picsum.photos/seed/cafe-equipo-cover/800/600',
      3
    );

  -- 8b. Fotos — Álbum: Nuestro Espacio
  INSERT INTO gallery_photos (id, business_id, album_id, image_url, alt, caption, sort_order)
  VALUES
    (
      '70000000-0000-4000-8000-000000000101', biz,
      '70000000-0000-4000-8000-000000000001',
      'https://picsum.photos/seed/cafe-esp-1/800/600',
      'Salón principal con mesas de madera y luz natural',
      'Nuestro acogedor salón principal',
      1
    ),
    (
      '70000000-0000-4000-8000-000000000102', biz,
      '70000000-0000-4000-8000-000000000001',
      'https://picsum.photos/seed/cafe-esp-2/800/600',
      'Barra de café con máquina espresso profesional',
      'La barra donde preparamos cada taza',
      2
    ),
    (
      '70000000-0000-4000-8000-000000000103', biz,
      '70000000-0000-4000-8000-000000000001',
      'https://picsum.photos/seed/cafe-esp-3/800/600',
      'Terraza exterior con plantas y sillas de mimbre',
      'Terraza para disfrutar al aire libre',
      3
    ),
    (
      '70000000-0000-4000-8000-000000000104', biz,
      '70000000-0000-4000-8000-000000000001',
      'https://picsum.photos/seed/cafe-esp-4/800/600',
      'Detalle de decoración con cuadros y plantas verdes',
      'Los pequeños detalles que nos hacen únicos',
      4
    );

  -- 8c. Fotos — Álbum: Productos
  INSERT INTO gallery_photos (id, business_id, album_id, image_url, alt, caption, sort_order)
  VALUES
    (
      '70000000-0000-4000-8000-000000000105', biz,
      '70000000-0000-4000-8000-000000000002',
      'https://picsum.photos/seed/cafe-prod-1/800/600',
      'Taza de café con arte latte en forma de hoja',
      'Nuestro espresso con arte latte',
      1
    ),
    (
      '70000000-0000-4000-8000-000000000106', biz,
      '70000000-0000-4000-8000-000000000002',
      'https://picsum.photos/seed/cafe-prod-2/800/600',
      'Selección de pasteles artesanales en vitrina',
      'Pasteles horneados cada mañana',
      2
    ),
    (
      '70000000-0000-4000-8000-000000000107', biz,
      '70000000-0000-4000-8000-000000000002',
      'https://picsum.photos/seed/cafe-prod-3/800/600',
      'Frapuccino con crema batida y caramelo',
      'Bebidas frías para cualquier momento',
      3
    ),
    (
      '70000000-0000-4000-8000-000000000108', biz,
      '70000000-0000-4000-8000-000000000002',
      'https://picsum.photos/seed/cafe-prod-4/800/600',
      'Sandwich de jamón y queso con ensalada lateral',
      'También servimos comida ligera',
      4
    );

  -- 8d. Fotos — Álbum: Nuestro Equipo
  INSERT INTO gallery_photos (id, business_id, album_id, image_url, alt, caption, sort_order)
  VALUES
    (
      '70000000-0000-4000-8000-000000000109', biz,
      '70000000-0000-4000-8000-000000000003',
      'https://picsum.photos/seed/cafe-team-1/800/600',
      'Barista preparando café con técnica de vertido',
      'Nuestro barista principal en acción',
      1
    ),
    (
      '70000000-0000-4000-8000-000000000110', biz,
      '70000000-0000-4000-8000-000000000003',
      'https://picsum.photos/seed/cafe-team-2/800/600',
      'Equipo completo sonriendo en la entrada del café',
      'El equipo que hace posible cada día',
      2
    ),
    (
      '70000000-0000-4000-8000-000000000111', biz,
      '70000000-0000-4000-8000-000000000003',
      'https://picsum.photos/seed/cafe-team-3/800/600',
      'Chef pastelera decorando un pastel de chocolate',
      'Nuestra chef pastelera creando maravillas',
      3
    ),
    (
      '70000000-0000-4000-8000-000000000112', biz,
      '70000000-0000-4000-8000-000000000003',
      'https://picsum.photos/seed/cafe-team-4/800/600',
      'Personal de servicio atendiendo mesa con amabilidad',
      'Siempre con una sonrisa para recibirte',
      4
    );

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 9. BLOG: artículos de Café La Esquina
  --    3 posts publicados con body completo, tags y autor
  --    IDs: 80000000-0000-4000-8000-000000000001..3
  -- ═══════════════════════════════════════════════════════════════════════════

  INSERT INTO business_blog_posts
    (id, business_id, slug, title, summary, body, published_at, author, tags)
  VALUES
    (
      '80000000-0000-4000-8000-000000000001', biz,
      'el-arte-del-cafe-perfecto',
      'El Arte del Café Perfecto',
      'Descubre los secretos detrás de cada taza que preparamos y cómo lograr el equilibrio ideal entre acidez, cuerpo y aroma.',
      ARRAY[
        'En Café La Esquina creemos que un buen café no es accidente — es ciencia y pasión aplicadas a cada gramo de café molido. Desde la selección del origen hasta la temperatura del agua, cada variable importa.',
        'La base de todo es el grano. Trabajamos con cafés de origen único, seleccionados por su perfil de sabor: notas cítricas de los arábicas de altura, o el cuerpo achocolatado de los robustas de tierras bajas. Cada mes exploramos nuevos orígenes para ofrecerte algo diferente.',
        'La extracción es donde todo se decide. Para un espresso perfecto buscamos entre 25 y 30 segundos de extracción con una presión de 9 bares. Demasiado rápido y el café será ácido y aguado; demasiado lento y será amargo y astringente.',
        'El agua, que constituye el 98% de tu taza, debe estar entre 90°C y 96°C. El agua hirviendo quema el café; demasiado fría no extrae los compuestos aromáticos. En La Esquina usamos agua filtrada a exactamente 93°C para todos nuestros espressos.',
        'El arte latte — o latte art — es la firma visual de nuestro trabajo. Aunque parece decorativo, la técnica de vertido del vapor en la leche indica que la textura es perfecta: cremosa, suave y a la temperatura correcta para disfrutarse sin quemarse.',
        'La próxima vez que visites La Esquina, cuéntale a nuestro barista qué perfil buscas. ¿Prefirieres algo intenso y achocolatado, o floral y ligero? Con esa información, elegiremos juntos el café y la preparación ideal para tu momento.'
      ],
      '2026-04-15',
      'Carlos Medina',
      ARRAY['café', 'técnicas', 'barista']
    ),
    (
      '80000000-0000-4000-8000-000000000002', biz,
      'nuestros-pasteles-artesanales',
      'Nuestros Pasteles Artesanales: Horneados Cada Mañana',
      'Conoce el proceso detrás de los pasteles y dulces que preparamos a diario: ingredientes locales, recetas propias y mucho cariño en cada pieza.',
      ARRAY[
        'Cada mañana, antes de que abra la cafetería, nuestra chef pastelera Ana ya lleva dos horas en la cocina. El olor a mantequilla dorada y vainilla recorre el local cuando los primeros clientes llegan — y eso no es casualidad.',
        'Trabajamos exclusivamente con ingredientes frescos y locales. La harina proviene de un molino artesanal de la provincia, los huevos son de granjas pequeñas, y las frutas llegan directamente del mercado cada dos días. Sin conservantes, sin mezclas industriales.',
        'El pastel estrella de La Esquina es nuestro bizcocho de café y chocolate. La receta lleva tres años perfeccionándose: capas esponjosas de bizcocho de cacao, crema de mascarpone con espresso reducido, y un glaseado de chocolate negro al 70%. Cada porción lleva el trabajo de horas.',
        'También preparamos torticas de guayaba con queso crema, magdalenas de coco y limón, y una selección rotativa que cambia según la temporada y lo que el mercado ofrezca esa semana. Si hay mangos frescos en julio, habrá tarta de mango.',
        'Para los pedidos especiales — cumpleaños, reuniones, celebraciones — ofrecemos pasteles personalizados con al menos 48 horas de antelación. Escríbenos por WhatsApp para coordinar tu pedido y cuéntanos la ocasión; nos encargaremos de hacer algo memorable.',
        'Cuando visites la vitrina del local, no dudes en preguntar qué hay de nuevo ese día. La variedad es parte de nuestra filosofía: queremos que cada visita te sorprenda con algo que no esperabas encontrar.'
      ],
      '2026-04-08',
      'Ana García',
      ARRAY['repostería', 'artesanal', 'ingredientes']
    ),
    (
      '80000000-0000-4000-8000-000000000003', biz,
      'la-historia-de-cafe-la-esquina',
      'La Historia de Café La Esquina',
      'Cómo un pequeño local de barrio se convirtió en el punto de encuentro favorito de la comunidad, y por qué el café siempre fue el hilo conductor.',
      ARRAY[
        'Todo comenzó con una pregunta simple: ¿por qué en este barrio no hay un lugar donde tomarse un buen café con calma? Esa pregunta, que Luis Pérez se hacía cada mañana mientras caminaba al trabajo, fue la semilla de lo que hoy es Café La Esquina.',
        'En 2019, Luis alquiló un pequeño local de esquina — de ahí el nombre — que había sido peluquería, ferretería y un breve periodo panadería. Las paredes guardaban capas de historia que decidió respetar: las vigas de madera original se limpiaron y barnizaron, los azulejos del suelo se restauraron, y los ventanales se dejaron abiertos al barrio.',
        'Los primeros meses fueron un aprendizaje constante. El menú inicial era austero: espresso, café americano, dos tipos de tostadas y un pastel del día. Pero la calidad del café — seleccionado con obsesión desde el inicio — comenzó a correr de boca en boca.',
        'El equipo creció orgánicamente. Carlos, el barista principal, llegó al segundo mes buscando trabajo y demostró en la primera prueba que sabía más de extracción que nadie en el local. Ana, la chef pastelera, se unió seis meses después con sus propias recetas familiares que transformaron por completo la vitrina.',
        'Hoy, Café La Esquina es mucho más que una cafetería. Es el lugar donde los vecinos se reúnen por la mañana antes del trabajo, donde los estudiantes estudian por las tardes, y donde las familias celebran los domingos con algo dulce. El café sigue siendo el hilo que une todo.',
        'Mirando hacia adelante, queremos seguir siendo ese lugar de la esquina: cercano, auténtico y con la mejor taza de café que puedas encontrar. Gracias por ser parte de esta historia que, en realidad, la escribís vosotros cada día que nos visitáis.'
      ],
      '2026-03-22',
      'Luis Pérez',
      ARRAY['historia', 'equipo', 'comunidad']
    );

END $$;
