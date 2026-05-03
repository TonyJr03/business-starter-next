# Flujo de datos — business-starter-next

Documenta cómo fluye la información en este proyecto: desde Supabase hasta las páginas públicas y el panel de administración.

---

## Índice

1. [Visión general](#1-visión-general)
2. [Capa de tipos](#2-capa-de-tipos)
3. [Capa de persistencia — Mappers](#3-capa-de-persistencia--mappers)
4. [Capa de servicios — Lectura pública](#4-capa-de-servicios--lectura-pública)
5. [Clientes Supabase](#5-clientes-supabase)
6. [Capa de administración](#6-capa-de-administración)
   - [Contexto de admin](#61-contexto-de-admin-libadmincontextts)
   - [Mutations](#62-mutations-libadminmutations)
   - [Server Actions](#63-server-actions)
   - [Hook useAdminForm](#64-hook-useadminform)
7. [Flujo completo — página pública](#7-flujo-completo--página-pública)
8. [Flujo completo — panel de admin (CRUD)](#8-flujo-completo--panel-de-admin-crud)
9. [Tablas Supabase por dominio](#9-tablas-supabase-por-dominio)
10. [Convenciones generales](#10-convenciones-generales)

---

## 1. Visión general

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SUPABASE (PostgreSQL)                       │
│  businesses │ catalog_pages │ catalog_categories │ catalog_products  │
│  about │ faq │ gallery_albums │ gallery_photos │ blog │ promotions   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
              ┌────────────────┼─────────────────┐
              │                │                 │
     ┌────────▼──────┐  ┌──────▼──────┐  ┌──────▼──────────┐
     │   Mappers     │  │   Mappers   │  │    Mappers      │
     │ lib/persist.. │  │ lib/persist │  │  lib/persist..  │
     │  Row → Domain │  │ Row→Domain  │  │   Row → Domain  │
     └────────┬──────┘  └──────┬──────┘  └──────┬──────────┘
              │                │                 │
     ┌────────▼──────┐         │        ┌────────▼──────────┐
     │   Services    │         │        │  Admin Mutations  │
     │  services/    │         │        │ lib/admin/mutati  │
     │ (lectura pública,       │        │ (CREATE/UPDATE/   │
     │  cacheada con │         │        │  DELETE + Zod)    │
     │  React.cache) │         │        └────────┬──────────┘
     └────────┬──────┘         │                 │
              │                │        ┌────────▼──────────┐
     ┌────────▼──────┐         │        │  Server Actions   │
     │  Server       │         │        │ app/.../actions.ts│
     │  Components   │         │        │ (FormData → Zod   │
     │  (páginas     │         │        │  → mutation →     │
     │   públicas)   │         │        │  revalidate +     │
     └───────────────┘         │        │  redirect)        │
                               │        └────────┬──────────┘
                               │                 │
                               │        ┌────────▼──────────┐
                               │        │  Client Components │
                               │        │  *EditForm.tsx     │
                               │        │  useAdminForm()    │
                               │        └───────────────────┘
```

**Principios arquitecturales:**

- Los **Server Components** nunca importan de `lib/admin` — solo usan `services/`.
- Los **Server Actions** de admin nunca importan de `services/` — solo usan `lib/admin`.
- Los **mappers** son la única capa que conoce el esquema de base de datos (snake_case, tipos nullable, columnas exactas).
- El `business_id` siempre viaja en cada query para garantizar el aislamiento multi-tenant.

---

## 2. Capa de tipos

**Ubicación:** `types/`  
**Barrel export:** `types/index.ts` → se importa todo desde `@/types`

### Archivos y exports

| Archivo | Tipos que exporta |
|---|---|
| `business-config.ts` | Configuración global estática del negocio |
| `page-modules.ts` | Módulos de página (rutas habilitadas) |
| `section-modules.ts` | Módulos de sección (bloques del home) |
| `feature-modules.ts` | Feature flags |
| `business.ts` | `BusinessSettings`, `BusinessDirectoryItem`, `BusinessBranding`, `BusinessSocial`, `DayHours` |
| `catalog.ts` | `Catalog`, `Category`, `Product`, `Money`, `ProductBadge` |
| `about.ts` | `AboutContent`, `ContentFeature` |
| `faq.ts` | `FaqItem` |
| `gallery.ts` | `GalleryAlbum`, `GalleryPhoto` |
| `blog.ts` | `BlogPost` |
| `navigation.ts` | Tipos de navegación |
| `promotion.ts` | `Promotion`, `PromotionRule`, `PromotionStatus`, `DiscountType` |
| `testimonial.ts` | `Testimonial` |

### Regla de nombres

Los tipos de dominio usan **camelCase** (`imageUrl`, `sortOrder`, `isActive`) que corresponden directamente a los campos snake_case de la base de datos (`image_url`, `sort_order`, `is_active`). La conversión ocurre exclusivamente en los mappers.

### Tipos de forma local en los forms de admin

Los `*EditForm.tsx` declaran sus propias interfaces locales (ej. `interface ProductData`) que representan el subconjunto de campos que el formulario necesita mostrar/editar. Estas interfaces no se exportan al barrel de tipos, son locales al componente.

---

## 3. Capa de persistencia — Mappers

**Ubicación:** `lib/persistence/`  
**Barrel export:** `lib/persistence/index.ts`

Cada mapper define:
1. Una interfaz `*Row` que refleja exactamente la fila de la tabla en DB (snake_case, nullables).
2. Una función `rowTo*()` que convierte esa fila al tipo de dominio (camelCase, nulls → undefined).

### Mappers disponibles

#### `about.mapper.ts`
```
AboutRow → AboutContent
  team_image_url  →  teamImageUrl
  null            →  undefined
```

#### `blog.mapper.ts`
```
BlogPostRow → BlogPost
  published_at  →  publishedAt
  is_published  →  (dropped, el servicio filtra en query)
  null          →  undefined
```

#### `business.mapper.ts`
```
BusinessSettingsRow → BusinessSettings
  short_description  →  shortDescription
  JSONB fields (social, hours, branding, modules) → preservados tal cual

BusinessDirectoryRow → BusinessDirectoryItem
  short_description  →  shortDescription
```

#### `catalog.mapper.ts`
```
CatalogRow     → Catalog    (sort_order→sortOrder, image_url→imageUrl)
CategoryRow    → Category   (catalog_id→catalogId)
ProductRow     → Product    (money_amount+money_currency → Money{amount,currency})
```

#### `faq.mapper.ts`
```
FaqItemRow → FaqItem
  (solo expone id, question, answer, category — sort_order/is_active se descartan)
```

#### `gallery.mapper.ts`
```
GalleryAlbumRow → GalleryAlbum  (sort_order→sortOrder)
GalleryPhotoRow → GalleryPhoto  (album_id→albumId, image_url→imageUrl)
```

#### `promotion.mapper.ts`
```
PromotionRow → Promotion
  discount_label  →  discountLabel
  image_url       →  imageUrl
  starts_at       →  startsAt
  ends_at         →  endsAt
  sort_order      →  sortOrder
  rules (JSONB)   →  rules (preservado)
```

---

## 4. Capa de servicios — Lectura pública

**Ubicación:** `services/`  
**Barrel export:** `services/index.ts`

Los servicios son funciones **async** envueltas en `React.cache()` para deduplicar llamadas dentro del mismo request. Solo hacen lecturas — nunca mutaciones.

### Patrón general

```typescript
// Función interna (no exportada)
async function fetchXxxFromDB(businessId: string): Promise<XxxType[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];  // guard para builds sin config
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('table_name')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data) return [];
  return (data as XxxRow[]).map(rowToXxx);
}

// Export cacheado
export const getXxxItems = cache(fetchXxxFromDB);
```

### Servicios y sus queries

| Servicio | Función exportada | Tabla | Filtros principales |
|---|---|---|---|
| `about.service.ts` | `getAboutContent(businessId)` | `about` | `business_id`, `.maybeSingle()` |
| `blog.service.ts` | `getPosts(businessId)` | `blog` | `business_id`, `is_published=true`, orden `published_at DESC` |
| `blog.service.ts` | `getPostBySlug(businessId, slug)` | `blog` | `business_id`, `slug`, `is_published=true` |
| `business.service.ts` | `resolveBusinessBySlug(slug)` | `businesses` | `slug` |
| `business.service.ts` | `listActiveBusinesses()` | `businesses` | `is_active=true`, orden `name ASC` |
| `catalog.service.ts` | `getCatalogs()` | `catalog_pages` | `is_active=true`, orden `sort_order` |
| `catalog.service.ts` | `getCategories(filters?)` | `catalog_categories` | `is_active=true`, `catalog_id?` |
| `catalog.service.ts` | `getProducts(filters?)` | `catalog_products` | `is_available=true?`, `category_id?`, `is_featured?` |
| `faq.service.ts` | `getFaqItems(businessId)` | `faq` | `business_id`, `is_active=true` |
| `gallery.service.ts` | `getGalleryAlbums(businessId)` | `gallery_albums` | `business_id`, `is_active=true` |
| `gallery.service.ts` | `getGalleryPhotos(businessId, albumId?)` | `gallery_photos` | `business_id`, `is_active=true`, `album_id?` |
| `promotions.service.ts` | `getPromotions()` | `promotions` | orden `sort_order` |
| `promotions.service.ts` | `getActivePromotions(now?)` | `promotions` | filtra en memoria por `status === 'active'` |

### Helpers de dominio

```typescript
// catalog.service.ts
isProductAvailable(product: Product): boolean
  → product.isAvailable ?? true

// promotions.service.ts
getPromotionStatus(promotion, now?): PromotionStatus
  → 'upcoming' | 'active' | 'expired' | 'paused'
  → Compara startsAt/endsAt con fecha actual. Si status está explícito, lo respeta.

isPromotionActive(promotion, now?): boolean
  → getPromotionStatus(...) === 'active'
```

---

## 5. Clientes Supabase

### `lib/supabase/server.ts` — para Server Components y Server Actions

```typescript
export async function createSupabaseServerClient()
```

- Crea un cliente nuevo por cada request (no singleton).
- Lee y escribe cookies de sesión via `cookies()` de Next.js.
- Usado en: servicios, mutations, `getAdminContext`.
- El `try/catch` en `setAll` es seguro: Next.js no permite escribir cookies durante el render de Server Components, pero el middleware se encarga del refresco de tokens.

### `lib/supabase/client.ts` — para Client Components

```typescript
export function getSupabaseBrowserClient(): SupabaseClient
```

- Singleton perezoso: crea una instancia la primera vez, la reutiliza.
- Usado en Client Components que necesiten acceso directo a Supabase (auth UI, etc.).

---

## 6. Capa de administración

### 6.1 Contexto de admin — `lib/admin/context.ts`

```typescript
interface AdminContext {
  businessId: string   // UUID del negocio en la tabla businesses
  userId: string       // UUID del usuario autenticado en Supabase Auth
  userEmail: string    // Email del usuario (para la UI)
  supabase: SupabaseServerClient
}

type AdminContextResult =
  | { ok: true; ctx: AdminContext }
  | { ok: false; error: string }

async function getAdminContext(slug: string): Promise<AdminContextResult>
```

`getAdminContext` es el **guardián** de todas las acciones de admin:

1. Llama a `getUser()` — si no hay sesión, retorna error.
2. Llama a `resolveBusinessBySlug(slug)` — si el negocio no existe, retorna error.
3. Crea el cliente Supabase con la sesión activa.
4. Devuelve el contexto listo para usar.

Cada Server Action de admin llama a `getAdminContext` como primera línea. Si falla, retorna inmediatamente sin tocar la base de datos.

**Tipos de resultado:**

```typescript
// Estado que devuelven las Server Actions (alimenta useAdminForm)
type AdminActionState = {
  ok: boolean
  error?: string
  field?: string   // Campo específico con error (para resaltar el input)
} | null

// Lo que retornan las funciones de mutation
type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string }
```

---

### 6.2 Mutations — `lib/admin/mutations/`

Cada archivo de mutation maneja un dominio. Sigue este patrón:

1. **Schema Zod** para validación de entradas (create + update como `.partial()`).
2. **Funciones `create*`, `update*`, `delete*`** que reciben `AdminContext` y ejecutan la query.
3. Siempre incluyen `business_id = ctx.businessId` en las queries para aislamiento multi-tenant.
4. Retornan `MutationResult<DomainType>`.

#### Mutations por dominio

| Archivo | Entidades | Operaciones |
|---|---|---|
| `about.mutation.ts` | `AboutContent` | `updateAbout` (UPSERT) |
| `blog.mutation.ts` | `BlogPost` | `createPost`, `updatePost`, `deletePost` |
| `catalog.mutation.ts` | `Catalog`, `Category`, `Product` | create/update/delete para cada entidad |
| `faq.mutation.ts` | `FaqItem` | `createFaqItem`, `updateFaqItem`, `deleteFaqItem` |
| `gallery.mutation.ts` | `GalleryAlbum`, `GalleryPhoto` | create/update/delete para cada entidad |
| `promotions.mutation.ts` | `Promotion` | `createPromotion`, `updatePromotion`, `deletePromotion` |
| `settings.mutation.ts` | `BusinessSettings` | `updateSettings` |

#### Comportamientos comunes

- **Slug auto-generado:** `createPost`, `createCatalogPage`, `createCategory`, `createProduct`, `createAlbum` generan el slug desde el nombre via `toSlug()`.
- **Patch parcial en updates:** Solo los campos definidos en el input se incluyen en el `UPDATE`. Los `undefined` se omiten.
- **Error de duplicado (PG 23505):** Las mutations de create atrapan el código y retornan un error legible: *"Ya existe un artículo con ese título."*
- **Error de FK (PG 23503):** Similar — mensaje amigable en lugar de error de DB crudo.
- **About usa UPSERT:** La tabla `about` tiene una sola fila por negocio — se usa `INSERT ... ON CONFLICT DO UPDATE`.

---

### 6.3 Server Actions

**Ubicación:** `app/negocios/[slug]/(admin)/admin/{dominio}/actions.ts`

Cada archivo de actions exporta las funciones `'use server'` que los formularios invocan.

**Firma estándar:**

```typescript
// Para crear
export async function createXxxAction(
  slug: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState>

// Para actualizar (recibe el id como parámetro enlazado)
export async function updateXxxAction(
  slug: string,
  id: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState>

// Para eliminar
export async function deleteXxxAction(
  slug: string,
  id: string,
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState>
```

Los parámetros extra (`slug`, `id`) se preenllazan con `.bind(null, slug, id)` en el Server Component que renderiza el form.

**Flujo interno de cada action:**

```
1. getAdminContext(slug)          → validar sesión + negocio
2. Extraer campos de FormData     → strings, arrays, booleans
3. schema.safeParse(raw)          → validar con Zod
   └─ Si error → return { ok: false, error, field }
4. mutation(ctx, parsed.data)     → escribir en DB
   └─ Si error → return { ok: false, error }
5. revalidatePath(...)            → invalidar caché del path público
6. redirect(...)                  → redirigir con query param ?saved=1
```

---

### 6.4 Hook `useAdminForm`

**Ubicación:** `components/admin/useAdminForm.ts`

```typescript
function useAdminForm(action: BoundAction): {
  state: AdminActionState        // null → error → success (con redirect)
  formAction: (fd: FormData) => void
  fieldError: (field: string) => string | undefined
}
```

Encapsula `useActionState` de React para todos los formularios de admin:

```typescript
// En el EditForm:
const { state, formAction, fieldError } = useAdminForm(
  updateFaqItemAction.bind(null, slug, item.id)
)

// En el JSX:
<form action={formAction}>
  <input name="question" />
  {fieldError('question') && <span>{fieldError('question')}</span>}
  <SubmitButton />
</form>
```

- `state` es `null` al inicio. Después de un submit fallido toma el valor `{ ok: false, error, field? }`.
- En submit exitoso, la action ejecuta `redirect()` del lado del servidor, por lo que el estado nunca llega a ser `{ ok: true }` en el cliente — simplemente navega.
- `fieldError('campo')` retorna el mensaje de error solo si `state.field === 'campo'`, para resaltar el input específico.

---

## 7. Flujo completo — página pública

Ejemplo con la página del blog:

```
URL: /negocios/cafe-la-esquina/blog

app/negocios/[slug]/(public)/blog/page.tsx  (Server Component)
  │
  ├─ 1. const business = await resolveBusinessBySlug('cafe-la-esquina')
  │       └─ services/business.service.ts
  │            └─ SELECT * FROM businesses WHERE slug = 'cafe-la-esquina'
  │            └─ rowToBusinessSettings(row) → BusinessSettings
  │
  ├─ 2. if (!business) notFound()
  │
  ├─ 3. if (!isModuleEnabled(business, 'blog')) notFound()
  │
  ├─ 4. const posts = await getPosts(business.id)
  │       └─ services/blog.service.ts  [React.cache]
  │            └─ SELECT * FROM blog
  │               WHERE business_id = business.id
  │                 AND is_published = true
  │               ORDER BY published_at DESC
  │            └─ rows.map(rowToBlogPost) → BlogPost[]
  │
  └─ 5. return <BlogGrid posts={posts} />
              (Server Component, sin JS en cliente)
```

**Cada servicio es cacheado por `React.cache()`** — si la misma página llama a `resolveBusinessBySlug` dos veces en el mismo request, Supabase solo recibe una query.

---

## 8. Flujo completo — panel de admin (CRUD)

### Lectura (page.tsx)

```
URL: /negocios/cafe-la-esquina/admin/faq/abc123

app/negocios/[slug]/(admin)/admin/faq/[faqId]/page.tsx  (Server Component)
  │
  ├─ 1. const ctxResult = await getAdminContext(slug)
  │       ├─ getUser() → sesión activa?
  │       ├─ resolveBusinessBySlug(slug) → negocio existe?
  │       └─ → AdminContext { businessId, userId, supabase }
  │
  ├─ 2. if (!ctxResult.ok) redirect('/login')
  │
  ├─ 3. const { data: row } = await ctx.supabase
  │         .from('faq')
  │         .select('*')
  │         .eq('id', faqId)
  │         .eq('business_id', ctx.businessId)   ← aislamiento tenant
  │         .single()
  │
  ├─ 4. if (!row) notFound()
  │
  └─ 5. return <FaqEditForm slug={slug} item={mapRowToLocalShape(row)} />
```

### Escritura (action → mutation → DB)

```
[Usuario edita el form y hace submit]
  │
  ▼
<FaqEditForm>  (Client Component)
  │  useAdminForm(updateFaqItemAction.bind(null, slug, item.id))
  │  formAction(formData)  → dispara la Server Action
  │
  ▼
updateFaqItemAction(slug, id, prevState, formData)  [Server Action]
  │
  ├─ 1. getAdminContext(slug) → AdminContext
  │
  ├─ 2. Extraer FormData:
  │       { question, answer, category, sortOrder, isActive }
  │
  ├─ 3. faqItemUpdateSchema.safeParse(raw)
  │       └─ Si inválido → return { ok: false, error: '...', field: 'question' }
  │          ↑ useAdminForm captura esto → fieldError('question') muestra el mensaje
  │
  ├─ 4. updateFaqItem(ctx, id, parsed.data)  ← lib/admin/mutations/faq.mutation.ts
  │       └─ UPDATE faq
  │          SET question=?, answer=?, category=?, sort_order=?, is_active=?
  │          WHERE id=? AND business_id=ctx.businessId
  │       └─ rowToFaqItem(data) → FaqItem
  │       └─ return { ok: true, data: FaqItem }
  │
  ├─ 5. revalidatePath(`/negocios/${slug}`, 'layout')
  │       └─ Invalida caché del path público → próxima visita verá datos frescos
  │
  └─ 6. redirect(`/negocios/${slug}/admin/faq?updated=1`)
          └─ Navega al listado; la página muestra banner de éxito

[Para DELETE: mismo flujo pero sin FormData relevante, solo ejecuta deleteXxx()]
[Para CREATE: igual que update, pero usa createSchema (sin .partial()) y redirige al nuevo recurso]
```

---

## 9. Tablas Supabase por dominio

| Tabla | Dominio | Mapper | Servicio público | Mutation admin |
|---|---|---|---|---|
| `businesses` | Negocio | `business.mapper.ts` | `business.service.ts` | `settings.mutation.ts` |
| `about` | Sobre nosotros | `about.mapper.ts` | `about.service.ts` | `about.mutation.ts` |
| `blog` | Blog | `blog.mapper.ts` | `blog.service.ts` | `blog.mutation.ts` |
| `faq` | FAQ | `faq.mapper.ts` | `faq.service.ts` | `faq.mutation.ts` |
| `catalog_pages` | Catálogos | `catalog.mapper.ts` | `catalog.service.ts` | `catalog.mutation.ts` |
| `catalog_categories` | Categorías | `catalog.mapper.ts` | `catalog.service.ts` | `catalog.mutation.ts` |
| `catalog_products` | Productos | `catalog.mapper.ts` | `catalog.service.ts` | `catalog.mutation.ts` |
| `gallery_albums` | Álbumes | `gallery.mapper.ts` | `gallery.service.ts` | `gallery.mutation.ts` |
| `gallery_photos` | Fotos | `gallery.mapper.ts` | `gallery.service.ts` | `gallery.mutation.ts` |
| `promotions` | Promociones | `promotion.mapper.ts` | `promotions.service.ts` | `promotions.mutation.ts` |

---

## 10. Convenciones generales

### Nombres

- **Tablas DB:** `snake_case` plural (`catalog_products`, `gallery_photos`).
- **Columnas DB:** `snake_case` (`sort_order`, `is_active`, `business_id`).
- **Tipos de dominio:** `PascalCase` interfaces, campos `camelCase`.
- **Funciones de mapper:** `rowToXxx(row: XxxRow): XxxDomainType`.
- **Funciones de servicio:** `getXxx(...)`, `resolveXxx(...)`, `listXxx(...)`.
- **Funciones de mutation:** `createXxx`, `updateXxx`, `deleteXxx`.
- **Server Actions:** `createXxxAction`, `updateXxxAction`, `deleteXxxAction`.

### Reglas de aislamiento multi-tenant

Toda query que accede a datos de negocio incluye `business_id`:
- Servicios públicos: `.eq('business_id', businessId)`.
- Mutations admin: `.eq('business_id', ctx.businessId)` tanto en lecturas como en escrituras.

Esto garantiza que ningún negocio puede leer ni modificar datos de otro, independientemente de RLS.

### Manejo de `null` vs `undefined`

- La DB retorna `null` para campos opcionales.
- Los mappers convierten `null → undefined` para que los tipos de dominio sean limpios (`field?: string` en lugar de `field: string | null`).
- Los forms de admin pasan `undefined` a las mutations; las mutations convierten `undefined → null` al escribir en DB.

### Caché de React

Los servicios usan `React.cache()` para deduplicar queries dentro del mismo request de servidor. Si un Server Component y un layout padre llaman al mismo servicio con los mismos argumentos, Supabase solo recibe una query.

### Revalidación de caché de Next.js

Después de cada mutación exitosa, la Server Action llama a:
```typescript
revalidatePath(`/negocios/${slug}`, 'layout')
```
Esto invalida el caché de todos los segmentos bajo ese path, garantizando que la próxima visita a la página pública muestre los datos actualizados.
