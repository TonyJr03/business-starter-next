# Technical Overview — business-starter-next

Documento de referencia completo para entender la arquitectura, los flujos de trabajo, los módulos y las capas del proyecto. Orientado a dar contexto a otro agente o desarrollador que llegue por primera vez.

---

## Índice

1. [Qué es este proyecto](#1-qué-es-este-proyecto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Modelo conceptual de la plataforma](#3-modelo-conceptual-de-la-plataforma)
4. [Estructura de rutas (App Router)](#4-estructura-de-rutas-app-router)
5. [Base de datos — Esquema Supabase](#5-base-de-datos--esquema-supabase)
6. [Sistema de módulos](#6-sistema-de-módulos)
7. [Sistema de branding](#7-sistema-de-branding)
8. [Capa de tipos](#8-capa-de-tipos)
9. [Capa de persistencia (mappers)](#9-capa-de-persistencia-mappers)
10. [Capa de servicios (lectura pública)](#10-capa-de-servicios-lectura-pública)
11. [Sección pública del tenant](#11-sección-pública-del-tenant)
12. [Panel admin del tenant](#12-panel-admin-del-tenant)
13. [Panel superadmin (plataforma)](#13-panel-superadmin-plataforma)
14. [Sistema de autenticación](#14-sistema-de-autenticación)
15. [Carrito y WhatsApp Ordering](#15-carrito-y-whatsapp-ordering)
16. [Directorio de la plataforma](#16-directorio-de-la-plataforma)
17. [Flujos de trabajo completos](#17-flujos-de-trabajo-completos)
18. [Convenciones del proyecto](#18-convenciones-del-proyecto)
19. [Variables de entorno](#19-variables-de-entorno)

---

## 1. Qué es este proyecto

`business-starter-next` es una **plataforma SaaS multi-tenant** que permite publicar un directorio de negocios locales, donde cada negocio tiene:

- Su propio **sitio web público** con catálogo, promociones, about, FAQ, galería y blog.
- Su propio **panel de administración** para gestionar el contenido de forma autónoma.
- **Branding personalizado** (colores, tipografías, tema) almacenado en base de datos.
- **Módulos activables** por tenant: el operador decide qué secciones y funcionalidades tiene activas cada negocio.

El operador de la plataforma controla todo desde el **panel superadmin**: crea negocios, gestiona administradores y configura los módulos.

### MVP actual: rutas con path

```
/                                         → Directorio público de negocios
/negocios/[slug]                          → Home del negocio
/negocios/[slug]/catalog                  → Catálogo
/negocios/[slug]/promotions               → Promociones
/negocios/[slug]/about                    → Nosotros
/negocios/[slug]/contact                  → Contacto
/negocios/[slug]/faq                      → FAQ
/negocios/[slug]/gallery                  → Galería
/negocios/[slug]/blog                     → Blog
/negocios/[slug]/admin                    → Panel admin del negocio
/superadmin                               → Panel del operador de plataforma
```

> **Fase 2 planificada (no implementada):** subdominios propios por tenant (`negocio.plataforma.com`). El cambio es solo de routing, no de datos ni lógica.

---

## 2. Stack tecnológico

| Componente        | Tecnología                                   |
|-------------------|----------------------------------------------|
| Framework         | Next.js 15 (App Router, Server Components)   |
| Lenguaje          | TypeScript (strict)                          |
| Base de datos     | Supabase (PostgreSQL + RLS)                  |
| Auth              | Supabase Auth (email/password)               |
| ORM / cliente DB  | `@supabase/ssr` (server) + `@supabase/js` (browser) |
| Validación        | Zod                                          |
| Estilos           | Tailwind CSS v4                              |
| Fuentes           | Geist Sans / Geist Mono (Next.js fonts)      |
| Imágenes          | `next/image` (Supabase Storage + picsum)     |
| Proxy             | `src/proxy.ts` (guard optimista de sesión)   |

---

## 3. Modelo conceptual de la plataforma

### Actores

| Actor | Descripción |
|-------|-------------|
| **Visitante** | Usuario anónimo que navega el directorio y los sitios públicos de los negocios. |
| **Admin de negocio** | Dueño/encargado del negocio. Accede a `/negocios/[slug]/admin` para gestionar su contenido. |
| **Superadmin** | Operador de la plataforma. Accede a `/superadmin` para crear negocios y gestionar admins. |

### Aislamiento multi-tenant

- Cada negocio se identifica por su `slug` en la URL y su `id` (UUID) en la base de datos.
- **Todas las queries incluyen `.eq('business_id', ctx.businessId)`** para garantizar que un admin nunca lea ni escriba datos de otro negocio.
- El aislamiento también se garantiza a nivel RLS de PostgreSQL mediante la función `is_business_admin(business_id)`.

---

## 4. Estructura de rutas (App Router)

El código de aplicación vive bajo `src/`. Los archivos de configuración de Next,
Supabase, ESLint, PostCSS, TypeScript y `public/` se mantienen en la raíz del
repositorio.

```
src/app/
├── layout.tsx                        # Root layout: HTML, fuentes, metadata base
├── globals.css                       # Estilos globales + Tailwind
├── forbidden.tsx                     # Página 403 (authInterrupts: true)
├── not-found.tsx                     # Página 404 global
│
├── (platform)/                       # Grupo de rutas: directorio de la plataforma
│   ├── layout.tsx                    # PlatformHeader + PlatformFooter
│   └── page.tsx                      # / → Directorio de negocios activos
│
├── negocios/
│   └── [slug]/                       # Tenant layout raíz
│       ├── layout.tsx                # Resuelve negocio, aplica branding CSS vars
│       │
│       ├── (public)/                 # Grupo de rutas públicas del tenant
│       │   ├── layout.tsx            # Header + Footer + CartShell
│       │   ├── page.tsx              # /negocios/[slug] — Home del tenant (Hero + sections)
│       │   ├── catalog/              # Módulo catálogo
│       │   │   └── page.tsx          # Con sub-rutas [catalogSlug]/ y [catalogSlug]/[categorySlug]/
│       │   ├── promotions/page.tsx   # Módulo promociones
│       │   ├── about/page.tsx        # Módulo nosotros
│       │   ├── contact/page.tsx      # Módulo contacto
│       │   ├── faq/page.tsx          # Módulo FAQ
│       │   ├── gallery/page.tsx      # Módulo galería
│       │   └── blog/                 # Módulo blog
│       │       ├── page.tsx          # Listado de posts
│       │       └── [slug]/page.tsx   # Post individual
│       │
│       └── admin/                    # Área admin del tenant
│           ├── (auth)/login/page.tsx # Login del admin
│           └── (panel)/              # Rutas protegidas
│               ├── layout.tsx        # Verifica sesión + membresía; monta AdminNav
│               ├── page.tsx          # Dashboard admin
│               ├── business/page.tsx # Datos del negocio (contacto, horarios, social)
│               ├── catalog/          # CRUD catálogos, categorías, productos
│               ├── promotions/       # CRUD promociones
│               ├── about/page.tsx    # Edición de "Nosotros"
│               ├── faq/              # CRUD preguntas frecuentes
│               ├── gallery/          # CRUD álbumes y fotos
│               └── blog/             # CRUD posts del blog
│
├── superadmin/                       # Área superadmin
│   ├── (auth)/login/page.tsx         # Login del superadmin
│   └── (panel)/                      # Rutas protegidas
│       ├── layout.tsx                # Verifica sesión + rol platform_admins; monta SuperAdminNav
│       ├── page.tsx                  # Dashboard: lista de todos los negocios
│       └── businesses/               # CRUD de negocios
│           ├── page.tsx              # Lista de negocios
│           ├── new/page.tsx          # Crear negocio
│           ├── actions.ts            # Server Actions: create/update/delete
│           └── [id]/                 # Edición de un negocio específico
│               ├── page.tsx
│               └── admins/           # Gestión de admins de ese negocio
│
└── api/                              # (vacío en MVP — reservado para futuras APIs)
```

### Grupos de ruta importantes

- `(platform)` — rutas del directorio raíz, sin prefijo de URL.
- `(public)` — rutas públicas del tenant, sin prefijo de URL adicional.
- `(panel)` — rutas protegidas del admin/superadmin, sin prefijo de URL adicional.
- `(auth)` — login pages no protegidas, sin prefijo de URL adicional.

---

## 5. Base de datos — Esquema Supabase

### Tabla `businesses` (migración 001)

Tabla raíz del tenant. Un registro = un negocio.

| Columna           | Tipo       | Descripción |
|-------------------|------------|-------------|
| `id`              | UUID PK    | Identificador único |
| `slug`            | TEXT UNIQUE| Segmento de URL (`cafe-la-esquina`) |
| `name`            | TEXT       | Nombre visible del negocio |
| `short_description` | TEXT     | Descripción corta para cards y SEO |
| `contact`         | JSONB      | `{ whatsapp, phone, email }` |
| `location`        | JSONB      | `{ address, city, country, street, municipality, mapUrl, coordinates }` |
| `logo`            | JSONB      | `{ url, alt }` |
| `social`          | JSONB      | `{ instagram, facebook, twitter, tiktok, telegram, youtube }` |
| `hours`           | JSONB      | `DayHours[]` — array de 7 días con open/close/isClosed |
| `is_active`       | BOOLEAN    | Si aparece en el directorio público |
| `branding`        | JSONB      | `BrandingOverride` — override parcial de colores/tipografías/themeKey |
| `modules`         | JSONB      | `ModulesOverride` — override parcial de páginas, secciones y features |
| `created_at`      | TIMESTAMPTZ | |
| `updated_at`      | TIMESTAMPTZ | Actualizado automáticamente por trigger |

### Tablas de contenido (migración 002)

| Tabla | Descripción | Clave foránea |
|-------|-------------|---------------|
| `catalog_pages` | Catálogos (uno o varios por negocio) | `business_id` |
| `catalog_categories` | Categorías dentro de un catálogo | `business_id`, `catalog_id` |
| `catalog_products` | Productos dentro de una categoría | `business_id`, `category_id` |
| `promotions` | Ofertas y promociones | `business_id` |
| `about` | Contenido "Nosotros" | `business_id` |
| `faq` | Preguntas frecuentes | `business_id` |
| `gallery_albums` | Álbumes de galería | `business_id` |
| `gallery_photos` | Fotos de la galería | `business_id`, `album_id` |
| `blog_posts` | Posts del blog | `business_id` |

### Tablas de roles (migraciones 003, 004)

| Tabla | Descripción |
|-------|-------------|
| `platform_admins` | Superadmins. `user_id` (FK `auth.users`). Solo service_role puede insertar. |
| `business_admins` | Relación user ↔ business. Solo platform_admins pueden asignar membresías. |

### RLS y función helper

Todas las tablas tienen **Row Level Security (RLS)** habilitado:
- `SELECT`: público (sin autenticación).
- `INSERT/UPDATE/DELETE`: requiere `is_business_admin(business_id)`.

```sql
-- Función helper (SECURITY DEFINER, STABLE)
-- Retorna true si el usuario autenticado es admin del negocio
-- o si tiene el rol de platform_admin.
is_business_admin(bid UUID) → BOOLEAN
```

---

## 6. Sistema de módulos

El sistema de módulos permite activar/desactivar secciones y funcionalidades por tenant sin tocar código.

### Tipos de módulos

| Tipo | ID | Descripción |
|------|----|-------------|
| **Page Module** | `PageModuleId` | Páginas completas con ruta propia |
| **Section Module** | `SectionModuleId` | Secciones de la home page |
| **Feature Module** | `FeatureModuleId` | Funcionalidades transversales sin ruta propia |

### Page Modules (`PageModuleId`)

```typescript
type PageModuleId = 'catalog' | 'promotions' | 'about' | 'contact' | 'faq' | 'gallery' | 'blog'
```

Cada page module tiene una `PageModuleConfig`:

```typescript
interface PageModuleConfig {
  enabled: boolean   // Si la página está activa
  path: string       // Ruta (ej. '/catalog')
  navLabel: string   // Label en el menú de navegación
  title?: string     // H1 de la página
  subtitle?: string  // Texto bajo el H1
  featuredTitle?: string  // Solo catalog: título de productos destacados
  emptyMessage?: string   // Mensaje cuando no hay contenido
}
```

> **Home no es un page module.** Es una ruta fija que siempre existe. Solo las rutas secundarias son activables.

### Section Modules (`SectionModuleId`)

```typescript
type SectionModuleId = 'highlights' | 'promotions' | 'hours' | 'location' | 'whatsapp_cta'
```

Son las secciones que se renderizan en la home debajo del Hero. Cada sección tiene:

```typescript
interface SectionModuleEntry extends SectionModuleConfig {
  dependsOn?: SectionDependency  // Condición de activación (el tenant no puede modificar esto)
}

interface SectionModuleConfig {
  enabled: boolean
  order: number          // Orden ascendente de renderizado
  layout?: SectionLayout // { bg, size, columns }
  title?: string
  subtitle?: string
  buttonLabel?: string   // Solo whatsapp_cta
  message?: string       // Solo whatsapp_cta: mensaje pre-cargado
}
```

Las dependencias (`dependsOn`) son condiciones que deben cumplirse para que una sección aparezca, independientemente de `enabled`:

| Sección | Dependencia |
|---------|-------------|
| `highlights` | `'about'` (page module about habilitado) |
| `promotions` | `'promotions'` (page module promotions habilitado) |
| `hours` | `'business.hours'` (el negocio tiene horarios configurados) |
| `whatsapp_cta` | `'business.whatsapp'` (el negocio tiene WhatsApp configurado) |
| `location` | `'business.location'` (el negocio tiene ubicación configurada) |

### Feature Modules (`FeatureModuleId`)

```typescript
type FeatureModuleId = 'cart' | 'whatsappOrdering'
```

| Feature | Descripción |
|---------|-------------|
| `cart` | Activa el carrito de compras (FAB, drawer, botón "Agregar al carrito") |
| `whatsappOrdering` | Activa el botón "Ordenar por WhatsApp" dentro del drawer del carrito |

### Resolver de módulos

**`src/lib/modules/resolver.ts`** — punto de entrada único para obtener la configuración efectiva de un tenant:

```typescript
// Merge: platformDefaults.modules + business.modules (overrides de DB)
resolveModules(business: BusinessSettings | null): ModulesConfig

// Retorna solo las secciones activas cuyas dependencias están satisfechas
resolveActiveSections(business: BusinessSettings | null): ResolvedSectionEntry[]

// Retorna un page module resuelto por su ID
resolvePageModule(business, 'catalog'): PageModuleConfig

// Retorna un feature module resuelto por su ID
resolveFeatureModule(business, 'cart'): FeatureModuleConfig
```

### Estrategia de merge

```
platformDefaults.modules (código, base para todos los tenants)
         +
business.modules JSONB (DB, ModulesOverride — solo los campos que el tenant sobreescribe)
         ↓
ModulesConfig efectivo para este tenant
```

- **Pages**: `{ ...base[id], ...override[id] }` por clave.
- **Sections**: shallow merge + deep-merge de `layout`; `dependsOn` nunca se sobreescribe.
- **Features**: `{ ...base[id], ...override[id] }` por clave.

---

## 7. Sistema de branding

### Flujo de resolución

```
platformDefaults.branding (base, todos los campos requeridos)
         +
business.branding JSONB (DB, BrandingOverride — solo los campos que el tenant sobreescribe)
         ↓
CSS custom properties inyectadas como `style` en el TenantLayout
```

### CSS Custom Properties generadas

| Variable CSS | Origen |
|---|---|
| `--color-primary` | `colors.primary` |
| `--color-secondary` | `colors.secondary` |
| `--color-accent` | `colors.accent` |
| `--color-footer-bg` | `colors.footerBg` |
| `--color-footer-text` | `colors.footerText` |
| `--color-footer-text-muted` | `colors.footerTextMuted` |
| `--color-footer-border` | `colors.footerBorder` |
| `--font-heading` | `typography.heading` |
| `--font-body` | `typography.body` |

### `data-theme`

El atributo `data-theme` en el wrapper del TenantLayout permite activar skins CSS completas:

```html
<div data-theme="default" style="--color-primary: #6F4E37; ...">
```

Valor: `business.branding.themeKey` (DB) → `platformDefaults.branding.themeKey` → `'default'`

### Branding por defecto de la plataforma

```typescript
// config/platform-defaults.ts
colors: {
  primary:         '#6F4E37',  // café
  secondary:       '#F5E6D3',
  accent:          '#D4A574',
  footerBg:        '#111827',
  footerText:      '#FFFFFF',
  footerTextMuted: '#9CA3AF',
  footerBorder:    '#1F2937',
}
typography: {
  heading: "'Inter', system-ui, sans-serif",
  body:    "'Inter', system-ui, sans-serif",
}
```

---

## 8. Capa de tipos

**Ubicación:** `src/types/`  
**Barrel:** `src/types/index.ts` → se importa todo desde `@/types`

### Mapa de archivos

| Archivo | Tipos exportados |
|---------|-----------------|
| `business.ts` | `BusinessSettings`, `BusinessDirectoryItem`, `BusinessLogo`, `BusinessContact`, `BusinessLocation`, `GeoCoordinates`, `BusinessSocial`, `DayHours` |
| `branding.ts` | `BrandingColors`, `BrandingTypography`, `BrandingConfig` |
| `overrides.ts` | `BrandingOverride`, `ModulesOverride` |
| `platform-defaults.ts` | `PlatformDefaults`, `ModulesConfig` |
| `page-modules.ts` | `PageModuleId`, `PageModuleConfig`, `PageModulesConfig` |
| `section-modules.ts` | `SectionModuleId`, `SectionModuleConfig`, `SectionModuleEntry`, `SectionModulesConfig`, `SectionLayout`, `SectionDependency` |
| `feature-modules.ts` | `FeatureModuleId`, `FeatureModuleConfig`, `FeatureModulesConfig` |
| `navigation.ts` | `NavItem`, `FooterSection` |
| `page-modules/catalog.ts` | `Catalog`, `Category`, `Product`, `Money`, `ProductBadge` |
| `page-modules/promotion.ts` | `Promotion`, `PromotionStatus`, `PromotionRule`, `DiscountType` |
| `page-modules/about.ts` | `AboutContent`, `Differentiator` |
| `page-modules/faq.ts` | `FaqItem` |
| `page-modules/gallery.ts` | `GalleryAlbum`, `GalleryPhoto` |
| `page-modules/blog.ts` | `BlogPost` |
| `feature-modules/cart.ts` | `CartItem` |

---

## 9. Capa de persistencia (mappers)

**Ubicación:** `src/lib/persistence/`  
**Barrel:** `src/lib/persistence/index.ts`

Los mappers son la **única capa que conoce el esquema de DB**: nombres de columnas en snake_case, tipos nullable, columnas exactas.

### Patrón mapper

Cada mapper exporta:
1. Un tipo `*Row` que refleja exactamente las columnas de la tabla.
2. Una función `rowTo*` que convierte `Row → tipo de dominio` (camelCase, null→undefined).

```typescript
// Ejemplo: business.mapper.ts
interface BusinessSettingsRow {
  id: string
  slug: string
  name: string
  short_description: string | null   // DB → undefined en dominio
  contact: BusinessContact | null
  branding: BrandingOverride | null   // JSONB parseado por Supabase
  modules: ModulesOverride | null
  // ...
}

function rowToBusinessSettings(row: BusinessSettingsRow): BusinessSettings
```

### Mappers disponibles

| Mapper | Row type | Función | Tabla DB |
|--------|----------|---------|----------|
| `business.mapper.ts` | `BusinessSettingsRow` | `rowToBusinessSettings` | `businesses` |
| `catalog.mapper.ts` | `CatalogRow`, `CategoryRow`, `ProductRow` | `rowToCatalog`, `rowToCategory`, `rowToProduct` | `catalog_pages`, `catalog_categories`, `catalog_products` |
| `promotion.mapper.ts` | `PromotionRow` | `rowToPromotion` | `promotions` |
| `about.mapper.ts` | `AboutRow` | `rowToAboutContent` | `about` |
| `faq.mapper.ts` | `FaqItemRow` | `rowToFaqItem` | `faq` |
| `gallery.mapper.ts` | `GalleryAlbumRow`, `GalleryPhotoRow` | `rowToGalleryAlbum`, `rowToGalleryPhoto` | `gallery_albums`, `gallery_photos` |
| `blog.mapper.ts` | `BlogPostRow` | `rowToBlogPost` | `blog_posts` |

---

## 10. Capa de servicios (lectura pública)

**Ubicación:** `src/services/`  
**Barrel:** `src/services/index.ts`

Los servicios son funciones de **solo lectura** envueltas con `React.cache()` para memoización por request. Solo se usan en Server Components de rutas públicas. **Nunca se usan en Server Actions de admin.**

### Servicios disponibles

```typescript
// business.service.ts
resolveBusinessBySlug(slug: string): Promise<BusinessSettings | null>
getAllBusinesses(): Promise<BusinessSettings[]>
getBusinessById(id: string): Promise<BusinessSettings | null>
listActiveBusinesses(): Promise<BusinessDirectoryItem[]>

// catalog.service.ts
getCatalogs(businessId): Promise<Catalog[]>
getCatalogBySlug(businessId, slug): Promise<Catalog | undefined>
getCategories(businessId): Promise<Category[]>
getCategoriesByCatalog(businessId, catalogId): Promise<Category[]>
getProducts(businessId): Promise<Product[]>
getFeaturedProducts(businessId): Promise<Product[]>
getProductsByCategory(businessId, categoryId): Promise<Product[]>
getProductBySlug(businessId, productSlug): Promise<Product | undefined>

// promotions.service.ts
getPromotions(businessId): Promise<Promotion[]>
getActivePromotions(businessId): Promise<Promotion[]>
getPromotionById(businessId, id): Promise<Promotion | undefined>
getPromotionStatus(promotion): PromotionStatus   // helper de dominio
isPromotionActive(promotion): boolean            // helper de dominio

// about.service.ts
getAboutContent(businessId): Promise<AboutContent | null>

// faq.service.ts
getFaqItems(businessId): Promise<FaqItem[]>

// gallery.service.ts
getGalleryAlbums(businessId): Promise<GalleryAlbum[]>
getGalleryPhotos(businessId): Promise<GalleryPhoto[]>
getPhotosByAlbum(businessId, albumId): Promise<GalleryPhoto[]>

// blog.service.ts
getPosts(businessId): Promise<BlogPost[]>
getPostBySlug(businessId, slug): Promise<BlogPost | undefined>
```

### Clientes Supabase

| Cliente | Archivo | Uso |
|---------|---------|-----|
| Server (SSR) | `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| Browser | `src/lib/supabase/client.ts` | Client Components (solo auth en browser) |

El cliente server usa `@supabase/ssr` para propagar las cookies de sesión del request entrante al cliente Supabase.

---

## 11. Sección pública del tenant

### Jerarquía de layouts

```
src/app/layout.tsx                    (HTML, fuentes, metadata plataforma)
  └── src/app/negocios/[slug]/layout.tsx   (resuelve negocio, aplica branding CSS vars)
        └── src/app/negocios/[slug]/(public)/layout.tsx  (Header + CartShell + Footer)
              └── page.tsx / catalog/page.tsx / ...
```

### Home del tenant (`/negocios/[slug]`)

1. Resuelve el negocio por slug (memoizado con `React.cache`).
2. Llama a `resolveActiveSections(business)` → lista de secciones activas cuyas dependencias están satisfechas.
3. Fetches condicionales: solo carga datos de las secciones que están activas.
4. Renderiza `<HeroSection>` (fijo, no configurable por módulo) seguido de `<SectionRenderer>` para cada sección activa.

### SectionRenderer

**`src/components/sections/SectionRenderer.tsx`** — decide qué componente renderizar según el `section.id`:

| `section.id` | Componente |
|---|---|
| `highlights` | `<HighlightsSection>` — diferenciadores del negocio |
| `promotions` | `<PromotionsSection>` — carrusel de promociones activas |
| `hours` | `<OpeningHoursSection>` — horarios por día |
| `whatsapp_cta` | `<CtaWhatsappSection>` — CTA con enlace wa.me |
| `location` | `<LocationSection>` — mapa embed + dirección |

### Header público

- Muestra el logo del negocio, el nombre y los links de navegación solo de los page modules habilitados.
- Soporta modo multi-catálogo: si el negocio tiene más de un catálogo activo, el link "Catálogo" se convierte en un dropdown.
- Incluye botón de carrito (`CartFab`) si el feature `cart` está activo.

### Catálogo público

El catálogo soporta dos modos según el número de catálogos activos:

| Modo | Condición | Comportamiento |
|------|-----------|----------------|
| **Single** | 1 catálogo | Navega directamente a `/catalog` sin selección |
| **Multi** | 2+ catálogos | Página de selección en `/catalog`; sub-rutas `/catalog/[catalogSlug]` |

### Carrito — flujo público

1. `CartShell` (Client Component) envuelve el `<main>` en el layout público.
2. Provee `CartContext` via `CartProvider` (estado en `localStorage`, aislado por `businessId`).
3. Si `cart.enabled`, monta `CartFab` (botón flotante con contador) y `CartDrawer` (panel lateral).
4. `AddToCartButton` en cada `ProductCard` llama a `useCart().addItem(product)`.
5. Si `whatsappOrdering.enabled` y el negocio tiene WhatsApp, el drawer muestra un botón que genera la URL `wa.me/[número]?text=[resumen del carrito]`.

---

## 12. Panel admin del tenant

### Ruta de acceso

```
/negocios/[slug]/admin/login    → formulario de login
/negocios/[slug]/admin          → dashboard (redirige desde login)
/negocios/[slug]/admin/[módulo] → páginas del panel
```

### Capas de seguridad (en orden)

1. **`src/proxy.ts`** — guard optimista: lee la cookie de sesión sin red. Si no hay sesión, redirige a `/login` inmediatamente.
2. **`(panel)/layout.tsx`** — guard seguro: llama a `getAdminContext(slug)` que verifica sesión + membresía en DB. Redirige o muestra forbidden según el error.
3. **Cada página** — llama a `getAdminContext(slug)` nuevamente para la tercera línea de defensa.

### AdminContext

```typescript
interface AdminContext {
  businessId: string    // UUID del negocio actual
  businessName: string  // Para el sidebar
  userId: string        // UUID del usuario autenticado
  userEmail: string     // Para el sidebar
  supabase: SupabaseServerClient  // Cliente con la sesión activa del request
}
```

`getAdminContext(slug)` verifica:
1. Sesión activa en Supabase Auth.
2. Negocio existente en DB para el slug.
3. Membresía en `business_admins` O rol de `platform_admins` (los superadmins pueden operar cualquier negocio).

### Módulos del panel admin

| Ruta | Funcionalidad |
|------|---------------|
| `admin/` | Dashboard: accesos rápidos a los módulos habilitados |
| `admin/business` | Editar datos del negocio: contacto, ubicación, horarios, redes sociales |
| `admin/catalog` | CRUD de catálogos, categorías y productos |
| `admin/promotions` | CRUD de promociones (título, descripción, imagen, fechas, estado, reglas) |
| `admin/about` | Editar contenido "Nosotros" + diferenciadores |
| `admin/faq` | CRUD de preguntas frecuentes |
| `admin/gallery` | CRUD de álbumes y fotos |
| `admin/blog` | CRUD de posts del blog |

> Los módulos deshabilitados siguen mostrándose en el dashboard como enlaces pero el contenido puede estar vacío. La barra de navegación (`AdminNav`) muestra todos los módulos siempre para facilitar la administración.

### Patrón CRUD en el panel admin

Todos los módulos siguen el mismo patrón:

```
Server Component (page.tsx)
  → getAdminContext()             verificar sesión y obtener ctx
  → fetch directo a Supabase      (sin services/, sin caché)
  → renderiza lista + botones
  → formulario como Client Component (*EditForm.tsx)
      → useAdminForm()            gestiona estado del form
      → Server Action (actions.ts)
          → getAdminContext()     nueva verificación en la acción
          → validar con Zod
          → llamar mutation (lib/admin/mutations/*.mutation.ts)
          → revalidatePath()
          → redirect()
```

### Mutations disponibles (`lib/admin/mutations/`)

| Archivo | Operaciones |
|---------|-------------|
| `catalog.mutation.ts` | `createCatalogPage`, `updateCatalogPage`, `deleteCatalogPage`, `createCategory`, `updateCategory`, `deleteCategory`, `createProduct`, `updateProduct`, `deleteProduct` |
| `promotions.mutation.ts` | `createPromotion`, `updatePromotion`, `deletePromotion` |
| `about.mutation.ts` | `updateAbout` |
| `faq.mutation.ts` | `createFaqItem`, `updateFaqItem`, `deleteFaqItem` |
| `gallery.mutation.ts` | `createAlbum`, `updateAlbum`, `deleteAlbum`, `createPhoto`, `updatePhoto`, `deletePhoto` |
| `blog.mutation.ts` | `createBlogPost`, `updateBlogPost`, `deleteBlogPost` |
| `business.mutation.ts` | `updateBusiness` (admin de tenant: solo contacto/ubicación/social/horas), `createBusiness`, `updateBusinessById`, `deleteBusiness` (solo superadmin) |
| `branding.mutation.ts` | `updateBranding` |
| `modules.mutation.ts` | `updateModules` |

Todas las mutations retornan `MutationResult<T>`:
```typescript
type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string }
```

### `useAdminForm` hook

**`components/admin/useAdminForm.ts`** — wrapper sobre `useActionState` de React para integrar Server Actions con formularios:
- Maneja estado de loading, error y success.
- Compatible con `AdminActionState`.

---

## 13. Panel superadmin (plataforma)

### Ruta de acceso

```
/superadmin/login      → formulario de login
/superadmin            → dashboard con todos los negocios
/superadmin/businesses → lista de negocios (CRUD)
```

### SuperAdminContext

```typescript
interface SuperAdminContext {
  userId: string
  userEmail: string
  supabase: SupabaseServerClient
}
```

`getSuperAdminContext()` verifica:
1. Sesión activa en Supabase Auth.
2. Existencia del `user_id` en la tabla `platform_admins`.

### Funcionalidades del panel superadmin

| Sección | Descripción |
|---------|-------------|
| **Dashboard** | Resumen de todos los negocios registrados (activos e inactivos) |
| **Businesses** | CRUD completo de negocios: crear, editar, eliminar |
| **Business detail** | Editar todos los campos: nombre, slug, isActive + contacto, ubicación, horarios, social |
| **Business admins** | Asignar y revocar administradores por negocio |

### Diferencias de permisos: admin de tenant vs superadmin

| Campo | Admin de negocio | Superadmin |
|-------|-----------------|------------|
| `name` | ✗ No puede cambiar | ✓ |
| `slug` | ✗ No puede cambiar | ✓ |
| `is_active` | ✗ No puede cambiar | ✓ |
| Contacto, ubicación, social, horarios | ✓ | ✓ |
| Crear/eliminar negocios | ✗ | ✓ |
| Asignar admins | ✗ | ✓ |

Los superadmins también **pueden operar como admin de cualquier negocio** sin necesidad de estar en `business_admins`, gracias al check en `getAdminContext()`:

```typescript
// El superadmin pasa la verificación de membresía de cualquier negocio
if (!membership && !isPlatformAdmin) {
  return { ok: false, error: 'No autorizado' }
}
```

---

## 14. Sistema de autenticación

### Flujo de login (admin de tenant)

```
Usuario → POST /negocios/[slug]/admin/login
  → loginAction(slug, prevState, formData)
  → supabase.auth.signInWithPassword({ email, password })
  → si error: retorna { error: '...' }
  → getAdminContext(slug)         verificar membresía
  → si no es admin: signOut() + retorna error
  → redirect(`/negocios/${slug}/admin`)
```

### Flujo de login (superadmin)

```
Usuario → POST /superadmin/login
  → superadminLoginAction(prevState, formData)
  → supabase.auth.signInWithPassword({ email, password })
  → getSuperAdminContext()        verificar rol platform_admins
  → si no es superadmin: signOut() + retorna error
  → redirect('/superadmin')
```

### Flujo de logout

```
Usuario → logoutAction(slug) / superadminLogoutAction()
  → supabase.auth.signOut()
  → redirect('/negocios/[slug]/admin/login') / redirect('/superadmin/login')
```

### `src/proxy.ts`

Intercepta todas las rutas protegidas antes del render:

```typescript
// Patrones de rutas protegidas
const ADMIN_PATTERN    = /^\/negocios\/[^/]+\/admin(\/|$)/
const SUPERADMIN_PATTERN = /^\/superadmin(\/|$)/
```

Para rutas que coinciden:
1. Lee la sesión del cookie sin hacer una petición de red.
2. Si no hay sesión: `redirect(loginUrl)`.
3. Si hay sesión: propaga la respuesta con `Cache-Control: no-store`.

> El proxy es un guard **optimista** (cookie puede estar expirado). La verificación real se hace en cada layout de panel y en cada Server Action.

---

## 15. Carrito y WhatsApp Ordering

### Arquitectura del carrito

```
lib/cart/cart-context.tsx     → CartProvider + useCart hook (Client)
  ├── CartStore (externo a React, useSyncExternalStore)
  ├── Persiste en localStorage con key "cart:[businessId]"
  └── Sin hydration mismatch: getServerSnapshot retorna []

components/cart/
  ├── CartShell.tsx            → Wrapper Client Component (provee contexto)
  ├── CartFab.tsx              → Botón flotante con contador de ítems
  ├── CartDrawer.tsx           → Panel lateral con lista de ítems y checkout
  └── AddToCartButton.tsx      → Botón en ProductCard
```

### Feature flags del carrito

| Flag | Efecto |
|------|--------|
| `cart.enabled = false` | CartProvider existe pero `CartFab` y `CartDrawer` no se montan |
| `cart.enabled = true` | UI del carrito completamente activa |
| `whatsappOrdering.enabled = true` | Botón "Ordenar por WhatsApp" visible en el drawer |

### Generación del mensaje WhatsApp

**`lib/whatsapp.ts`** — `getWhatsAppUrl(message?, phoneNumber?)`:
- Formatea el número E.164 eliminando caracteres no numéricos.
- Construye `https://wa.me/[número]?text=[mensaje codificado]`.
- El mensaje incluye el nombre del negocio y el resumen del carrito (nombre, cantidad, precio × unidad, total).

---

## 16. Directorio de la plataforma

### Ruta: `/`

**`src/app/(platform)/page.tsx`** — Server Component:
1. Llama a `listActiveBusinesses()` → `BusinessDirectoryItem[]` (solo negocios con `is_active = true`).
2. Renderiza una grilla de `BusinessCard` con nombre, descripción, ciudad y enlace al sitio del negocio.

### Layout de plataforma

**`src/app/(platform)/layout.tsx`** — envuelve el directorio con `PlatformHeader` y `PlatformFooter` (componentes genéricos de la plataforma, sin branding de tenant).

---

## 17. Flujos de trabajo completos

### Flujo: página pública del tenant

```
Request: GET /negocios/cafe-la-esquina/catalog

1. src/proxy.ts      — ruta pública, pasa sin guardia
2. TenantLayout      — resolveBusinessBySlug('cafe-la-esquina') → BusinessSettings
                     — resolveBrandVars(business) → CSS vars
                     — inyecta style + data-theme
3. PublicLayout      — resolveBusinessBySlug() [cache hit]
                     — getCatalogs(business.id)
                     — resolveFeatureModule(business, 'cart')
                     — renderiza Header + CartShell + Footer
4. CatalogPage       — resolvePageModule(business, 'catalog')
                     — si !enabled: notFound()
                     — getCatalogs() [cache hit]
                     — getCategories() + getProducts()
                     — renderiza la UI
```

### Flujo: Server Action admin (ejemplo: crear producto)

```
Usuario → submit form en /negocios/cafe-la-esquina/admin/catalog/new-product

1. Server Action createProductAction(prevState, formData)
   → getAdminContext('cafe-la-esquina')    verificar sesión + membresía
   → si !ctx.ok: return { ok: false, error }
   → parsear FormData
   → productCreateSchema.safeParse(raw)    validar con Zod
   → si !valid: return { ok: false, error, field }
   → createProduct(ctx, input)             mutation
       → supabase.from('catalog_products')
         .insert({ ...campos, business_id: ctx.businessId, category_id })
   → si error DB: return { ok: false, error }
   → revalidatePath('/negocios/cafe-la-esquina/admin/catalog')
   → redirect('/negocios/cafe-la-esquina/admin/catalog')
```

### Flujo: superadmin crea un negocio

```
1. POST /superadmin/businesses/new
   → createBusinessAction(prevState, formData)
   → getSuperAdminContext()           verificar rol platform_admins
   → businessSuperAdminSchema.parse() validar con Zod (nombre, slug, isActive)
   → createBusiness(ctx.supabase, input)
       → supabase.from('businesses').insert({ name, slug, is_active: true })
   → revalidatePath('/superadmin/businesses')
   → redirect('/superadmin/businesses/[id]') para completar el perfil
```

### Flujo: activar módulo catalog para un negocio (superadmin)

```
1. Admin edita la configuración de módulos del negocio
2. Server Action → updateModules(supabase, businessId, modulesOverride)
   → supabase.from('businesses').update({ modules: { pages: { catalog: { enabled: true } } } })
3. El resolver en el próximo request mezcla:
   platformDefaults.modules.pages.catalog (base: enabled: false)
   +  { enabled: true }  (override de DB)
   = { enabled: true, path: '/catalog', navLabel: 'Catálogo', ... }
4. La página /negocios/[slug]/catalog ya no llama a notFound()
5. El Header incluye el link "Catálogo" en el menú
```

### Flujo de branding: tenant sobreescribe colores

```
1. DB: businesses.branding = { colors: { primary: '#E63946' } }
2. TenantLayout:
   resolveBrandVars(business)
   → mergeBranding(platformDefaults.branding, { colors: { primary: '#E63946' } })
   → { colors: { primary: '#E63946', secondary: '#F5E6D3', ... }, typography: {...} }
   → { '--color-primary': '#E63946', '--color-secondary': '#F5E6D3', ... }
3. El CSS de Tailwind referencia var(--color-primary) en los utilitarios de marca
```

---

## 18. Convenciones del proyecto

### Separación de capas

| Capa | Puede importar de | No puede importar de |
|------|-----------------|----------------------|
| `types/` | Nada externo | — |
| `lib/persistence/` | `@/types` | `services/`, `lib/admin/` |
| `services/` | `@/types`, `lib/persistence`, `lib/supabase/server` | `lib/admin/` |
| `lib/admin/` | `@/types`, `lib/persistence`, `lib/supabase/server`, `services/` (solo business) | — |
| `components/` | `@/types`, `lib/` (excepto admin en public), `services/` (no en client) | — |
| Server Components (rutas públicas) | `services/`, `lib/modules`, `lib/branding` | `lib/admin/` |
| Server Actions (admin) | `lib/admin/`, `@/types` | `services/` |

### Naming conventions

- Archivos de tipos: `*.ts` (sin JSX)
- Componentes React: `PascalCase.tsx`
- Hooks: `use*.ts` o `use*.tsx`
- Server Actions: `actions.ts` junto a la página que los usa
- Mutations: `[dominio].mutation.ts`
- Mappers: `[dominio].mapper.ts`
- Servicios: `[dominio].service.ts`

### Seguridad

- **Nunca confiar en datos del cliente para el `business_id`**: siempre se obtiene de `ctx.businessId` en `getAdminContext()`.
- **Validación con Zod** en todas las Server Actions antes de llamar a mutations.
- **RLS en Supabase**: segunda línea de defensa a nivel base de datos.
- **Cache-Control: no-store** en respuestas de rutas protegidas (evita que el botón "atrás" muestre HTML protegido).
- **`authInterrupts: true`** en `next.config.ts` para habilitar `forbidden()` como función de interrupción.

### Caché y revalidación

- Los servicios públicos usan `React.cache()` → memoización por request (no entre requests).
- Las Server Actions usan `revalidatePath()` después de mutaciones para invalidar el caché de páginas.
- Las páginas admin hacen fetch **directamente a Supabase sin caché** para garantizar datos frescos.

---

## 19. Variables de entorno

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo server, no exponer) |
| `NEXT_PUBLIC_SITE_URL` | URL base del sitio para metadatBase y redirects |

El archivo `.env.example` en la raíz del proyecto documenta todas las variables necesarias.

---

## Apéndice: árbol de dependencias simplificado

```
types/
  └── (sin dependencias externas)

lib/persistence/
  └── @/types

lib/supabase/
  └── @supabase/ssr

services/
  ├── @/types
  ├── lib/persistence
  └── lib/supabase/server

lib/branding/resolver.ts
  ├── @/types
  └── config/platform-defaults

lib/modules/resolver.ts
  ├── @/types
  └── config/platform-defaults

lib/auth/
  └── lib/supabase/server

lib/admin/context.ts
  ├── @/types
  ├── lib/supabase/server
  └── services/ (resolveBusinessBySlug)

lib/admin/mutations/
  ├── @/types
  ├── lib/persistence
  └── lib/admin/context

lib/cart/cart-context.tsx
  └── @/types

components/
  ├── @/types
  ├── lib/ (varios)
  └── (no importa services/ directamente en client components)

app/ (Server Components públicos)
  ├── services/
  ├── lib/modules/resolver
  └── lib/branding/resolver

app/ (Server Actions admin)
  └── lib/admin/ (mutations + context)

config/platform-defaults.ts
  └── @/types
```
