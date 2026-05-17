# Phase 3 RLS audit

Fecha: 2026-05-17

Alcance: auditoria de migraciones actuales en `supabase/migrations`, exposicion publica de datos y contraste con la capa publica en `src/services`. No se modifico codigo ni migraciones.

## Resumen ejecutivo

El esquema actual tiene RLS habilitado en todas las tablas relevantes, pero las policies `SELECT` publicas de `businesses` y contenido siguen usando `USING (true)`. Eso significa que `anon`, `authenticated` sin rol, business admins y platform admins pueden leer todas las filas de esas tablas, incluyendo contenido inactivo, no disponible, pausado, vencido, futuro o no publicado.

La escritura fue endurecida por `004_business_admins.sql`: casi todas las mutations de contenido usan policies `INSERT/UPDATE/DELETE TO authenticated` con `is_business_admin(business_id)`. Esa funcion incluye a platform admins, asi que un platform admin puede escribir sobre cualquier negocio. `businesses.delete` queda reservado a platform admins. Las tablas internas `business_admins` y `platform_admins` no estan expuestas a `anon`.

La Fase 2 en `src/services` ya define muy bien la semantica publica deseada: catalogo activo/disponible, promociones activas y vigentes, blog publicado y no futuro, galeria/FAQ activos. El riesgo actual es que esa semantica vive solo en la app; no esta reforzada por RLS.

## Migraciones revisadas

- `supabase/migrations/001_businesses.sql`
- `supabase/migrations/002_pages_modules.sql`
- `supabase/migrations/003_platform_admins.sql`
- `supabase/migrations/004_business_admins.sql`

## Helpers de seguridad

### `set_updated_at()`

- Definida en `001_businesses.sql`.
- `SECURITY DEFINER`: no.
- Uso: triggers `BEFORE UPDATE` para mantener `updated_at`.
- Impacto RLS: ninguno directo.

### `is_business_admin(bid uuid)`

- Definida en `004_business_admins.sql`.
- `LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public`.
- Retorna `true` si:
  - existe `business_admins.user_id = auth.uid()` para `business_id = bid`, o
  - existe `platform_admins.user_id = auth.uid()`.
- Se usa en policies de escritura de `businesses` y tablas de contenido.
- Al ser `SECURITY DEFINER`, puede consultar `business_admins` y `platform_admins` sin depender de las policies de esas tablas. Es correcto para policies, pero conviene revisar permisos `EXECUTE` si se quiere evitar que se use como RPC para probar membresias por UUID.

### Helper faltante recomendado

No existe helper dedicado `is_platform_admin()`. Hoy se repite `EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())` en varias policies. Para Fase 3.2 conviene agregarlo como funcion `SECURITY DEFINER STABLE` y usarlo en policies de lectura/escritura de plataforma.

## Auditoria por tabla

### `businesses`

- Columnas principales: `id`, `slug`, `name`, `short_description`, `contact`, `location`, `logo`, `social`, `hours`, `is_active`, `branding`, `modules`, `created_at`, `updated_at`.
- `business_id`: no aplica, es la tabla raiz.
- Visibilidad publica: `is_active`.
- Configuracion/modulos: `branding`, `modules`.
- RLS: habilitado.
- SELECT actual:
  - `businesses_select_public`: `FOR SELECT USING (true)`.
- INSERT actual:
  - `businesses_insert_superadmin`: `TO authenticated WITH CHECK (EXISTS platform_admins auth.uid())`.
- UPDATE actual:
  - `businesses_update_admin`: `TO authenticated USING (is_business_admin(id)) WITH CHECK (is_business_admin(id))`.
- DELETE actual:
  - `businesses_delete_superadmin`: `TO authenticated USING (EXISTS platform_admins auth.uid())`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: parcialmente por `is_business_admin`; `insert/delete` por platform admin.
- Riesgo: `anon` puede leer negocios inactivos y datos completos de `contact`, `location`, `branding`, `modules`, etc. La app publica hace `notFound()` si `!business.isActive`, pero RLS no lo exige.

### `business_admins`

- Columnas principales: `user_id`, `business_id`, `created_at`.
- `business_id`: si.
- Visibilidad publica: ninguna.
- RLS: habilitado.
- SELECT actual:
  - `business_admins_select_self`: `TO authenticated USING (user_id = auth.uid())`.
- INSERT actual:
  - `business_admins_insert_superadmin`: `TO authenticated WITH CHECK (EXISTS platform_admins auth.uid())`.
- UPDATE actual: ninguna.
- DELETE actual:
  - `business_admins_delete_superadmin`: `TO authenticated USING (EXISTS platform_admins auth.uid())`.
- Lectura publica con `USING (true)`: no.
- Escritura protegida: si, solo platform admin.
- Riesgo: no hay exposicion anon. Platform admin puede insertar/eliminar membresias, pero no puede listar todas las membresias por SELECT normal; solo ve sus propias filas si existieran. Esto puede ser intencional hoy, pero limita pantallas futuras de gestion de admins.

### `platform_admins`

- Columnas principales: `user_id`, `created_at`.
- `business_id`: no.
- Visibilidad publica: ninguna.
- RLS: habilitado.
- SELECT actual:
  - `platform_admins_select_self`: `TO authenticated USING (user_id = auth.uid())`.
- INSERT actual: ninguna para `authenticated`; solo `service_role`/owner fuera de RLS.
- UPDATE actual: ninguna.
- DELETE actual: ninguna para `authenticated`.
- Lectura publica con `USING (true)`: no.
- Escritura protegida: si, sin policy para usuarios autenticados.
- Riesgo: no hay exposicion anon. Como en `business_admins`, no hay lectura global para platform admins mediante cliente normal.

### `catalog_pages`

- Columnas principales: `id`, `business_id`, `slug`, `name`, `description`, `image_url`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- `business_id`: si.
- Visibilidad publica: `is_active`; tambien depende de `businesses.is_active`.
- RLS: habilitado.
- SELECT actual:
  - `catalog_pages_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `catalog_pages_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `catalog_pages_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `catalog_pages_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer paginas de catalogo inactivas y de negocios inactivos.

### `catalog_categories`

- Columnas principales: `id`, `business_id`, `catalog_id`, `slug`, `name`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- `business_id`: si.
- Visibilidad publica: `is_active`; tambien depende de `businesses.is_active` y de `catalog_pages.is_active`.
- RLS: habilitado.
- SELECT actual:
  - `catalog_categories_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `catalog_categories_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `catalog_categories_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `catalog_categories_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer categorias inactivas y categorias cuyo catalogo padre esta inactivo. Riesgo adicional de integridad multi-tenant: la policy de escritura valida `business_id`, pero no comprueba que `catalog_id` pertenezca al mismo negocio.

### `catalog_products`

- Columnas principales: `id`, `business_id`, `category_id`, `slug`, `name`, `description`, `money`, `is_available`, `is_featured`, `badge`, `image_url`, `sort_order`, `created_at`, `updated_at`.
- `business_id`: si.
- Visibilidad publica: `is_available`; tambien depende de `businesses.is_active`, `catalog_pages.is_active` y `catalog_categories.is_active`.
- RLS: habilitado.
- SELECT actual:
  - `catalog_products_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `catalog_products_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `catalog_products_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `catalog_products_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer productos no disponibles, productos en categorias/catalogos inactivos y productos de negocios inactivos. Riesgo adicional de integridad multi-tenant: la policy valida `business_id`, pero no comprueba que `category_id` pertenezca al mismo negocio.

### `promotions`

- Columnas principales: `id`, `business_id`, `title`, `description`, `image_url`, `status`, `discount_label`, `starts_at`, `ends_at`, `rules`, `sort_order`, `created_at`, `updated_at`.
- `business_id`: si.
- Visibilidad publica: `status`, `starts_at`, `ends_at`; tambien depende de `businesses.is_active`.
- RLS: habilitado.
- SELECT actual:
  - `promotions_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `promotions_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `promotions_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `promotions_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer promociones pausadas, vencidas, futuras, con status desconocido o de negocios inactivos. `rules` es JSONB y podria contener referencias internas de productos/categorias.

### `about`

- Columnas principales: `id`, `business_id`, `story`, `mission`, `differentiators`, `team_image_url`, `created_at`, `updated_at`.
- `business_id`: si, unico.
- Visibilidad publica: no tiene flag propio; depende de `businesses.is_active` y modulos de app.
- RLS: habilitado.
- SELECT actual:
  - `about_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `about_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `about_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `about_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer about de negocios inactivos. Si el modulo about esta deshabilitado en `businesses.modules`, RLS tampoco lo oculta.

### `faq`

- Columnas principales: `id`, `business_id`, `question`, `answer`, `category`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- `business_id`: si.
- Visibilidad publica: `is_active`; tambien depende de `businesses.is_active`.
- RLS: habilitado.
- SELECT actual:
  - `faq_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `faq_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `faq_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `faq_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer FAQ inactivas y de negocios inactivos.

### `gallery_albums`

- Columnas principales: `id`, `business_id`, `slug`, `name`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- `business_id`: si.
- Visibilidad publica: `is_active`; tambien depende de `businesses.is_active`.
- RLS: habilitado.
- SELECT actual:
  - `gallery_albums_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `gallery_albums_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `gallery_albums_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `gallery_albums_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer albumes inactivos y de negocios inactivos.

### `gallery_photos`

- Columnas principales: `id`, `business_id`, `album_id`, `image_url`, `alt`, `caption`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- `business_id`: si.
- Visibilidad publica: `is_active`; tambien depende de `businesses.is_active` y `gallery_albums.is_active`.
- RLS: habilitado.
- SELECT actual:
  - `gallery_photos_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `gallery_photos_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `gallery_photos_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `gallery_photos_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer fotos inactivas, fotos de albumes inactivos y fotos de negocios inactivos. Riesgo adicional de integridad multi-tenant: la policy valida `business_id`, pero no comprueba que `album_id` pertenezca al mismo negocio.

### `blog`

- Columnas principales: `id`, `business_id`, `slug`, `title`, `summary`, `body`, `published_at`, `author`, `tags`, `is_published`, `created_at`, `updated_at`.
- `business_id`: si.
- Visibilidad publica: `is_published`, `published_at`; tambien depende de `businesses.is_active`.
- RLS: habilitado.
- SELECT actual:
  - `blog_select_public`: `FOR SELECT USING (true)`.
- INSERT/UPDATE/DELETE actuales:
  - `blog_insert_admin`: `TO authenticated WITH CHECK (is_business_admin(business_id))`.
  - `blog_update_admin`: `TO authenticated USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
  - `blog_delete_admin`: `TO authenticated USING (is_business_admin(business_id))`.
- Lectura publica con `USING (true)`: si.
- Escritura protegida: si.
- Riesgo: `anon` puede leer borradores, posts no publicados, posts futuros y posts de negocios inactivos.

## Lectura actual por rol

| Rol | Puede leer hoy |
| --- | --- |
| `anon` | Todas las filas de `businesses`, `catalog_pages`, `catalog_categories`, `catalog_products`, `promotions`, `about`, `faq`, `gallery_albums`, `gallery_photos`, `blog`. No puede leer `business_admins` ni `platform_admins`. |
| `authenticated` sin rol | Lo mismo que `anon` en tablas publicas/contenido. Ademas puede consultar `business_admins` solo para sus propias filas y `platform_admins` solo para su propia fila. |
| Business admin | Lo mismo que `authenticated` sin rol para lectura, porque las SELECT de contenido son globales. Puede leer contenido de otros negocios. Puede escribir sobre su negocio por `is_business_admin(business_id)`. |
| Platform admin | Lo mismo que `authenticated` sin rol para lectura de tablas publicas/contenido, que en la practica es todo. Puede escribir sobre cualquier negocio por `is_business_admin`. No tiene SELECT global sobre `business_admins`/`platform_admins` mediante policies actuales. |

## Riesgos concretos detectados

1. Negocios inactivos legibles por `anon` por `businesses_select_public USING (true)`.
2. Datos de configuracion `branding` y `modules` de todos los negocios legibles por `anon`.
3. Catalogos y categorias inactivas legibles por `anon`.
4. Productos no disponibles legibles por `anon`.
5. Promociones pausadas, vencidas, futuras o con status no publico legibles por `anon`.
6. Reglas internas de promociones (`rules` JSONB) legibles por `anon`.
7. FAQ inactivas legibles por `anon`.
8. Albumes inactivos y fotos inactivas legibles por `anon`.
9. Fotos de albumes inactivos legibles por `anon`.
10. Posts no publicados, sin fecha o con `published_at` futuro legibles por `anon`.
11. Contenido de negocios con modulo deshabilitado legible por `anon` si se consulta directo por API.
12. Business admins pueden leer contenido de todos los negocios por las SELECT globales, aunque solo puedan escribir en su negocio.
13. `business_admins` y `platform_admins` no estan expuestas a `anon`; no se detecta exposicion publica directa de relaciones internas.
14. Posible riesgo de integridad multi-tenant en escrituras directas: `catalog_categories.catalog_id`, `catalog_products.category_id` y `gallery_photos.album_id` no se validan contra el mismo `business_id` en las policies.

## Mismatch entre app services y RLS

| Area | Services publicos Fase 2 | RLS actual |
| --- | --- | --- |
| Negocio publico | Las paginas publicas hacen `notFound()` si `!business.isActive`; `listActiveBusinesses()` filtra `isActive`. | `businesses_select_public` permite leer todos los negocios. |
| Catalogo | `catalog_pages.is_active = true`; categorias activas y dentro de catalogos activos; productos `is_available = true` y dentro de categorias activas. | Todas las filas son legibles. |
| Promociones | `status = active` y helper descarta vencidas/futuras por `starts_at`/`ends_at`. | Todas las filas son legibles. |
| Blog | `is_published = true`, `published_at IS NOT NULL`, `published_at <= hoy America/Havana`. | Todas las filas son legibles. |
| Galeria | Albumes `is_active = true`; fotos `is_active = true` y dentro de albumes activos. | Todas las filas son legibles. |
| FAQ | `is_active = true`. | Todas las filas son legibles. |
| About | Sin flag propio; app depende de negocio activo y modulo habilitado. | Todas las filas son legibles. |

## Matriz objetivo preliminar para Fase 3.2

| Tabla | Lectura publica deseada | Lectura business admin deseada | Lectura platform admin deseada | Escritura business admin deseada | Escritura platform admin deseada |
| --- | --- | --- | --- | --- | --- |
| `businesses` | Solo `is_active = true`. | Su negocio, activo o inactivo. | Todos. | Update de su negocio. Columnas sensibles limitadas por mutations, no por RLS. | Insert/update/delete todos. |
| `business_admins` | Ninguna. | Sus propias membresias como hoy. | Todas las membresias si se necesita gestion de admins. | Ninguna. | Insert/delete, posiblemente select all. |
| `platform_admins` | Ninguna. | Ninguna salvo self si aplica. | Self o todos, segun necesidad de panel. | Ninguna. | Solo service role o flujo superadmin muy controlado. |
| `catalog_pages` | Negocio activo + `is_active = true`. | Todas las filas de su negocio. | Todas. | CRUD de su negocio. | CRUD todos. |
| `catalog_categories` | Negocio activo + categoria activa + catalogo padre activo. | Todas las filas de su negocio. | Todas. | CRUD de su negocio y padre del mismo negocio. | CRUD todos. |
| `catalog_products` | Negocio activo + producto disponible + categoria/catalogo padre activos. | Todas las filas de su negocio. | Todas. | CRUD de su negocio y padre del mismo negocio. | CRUD todos. |
| `promotions` | Negocio activo + `status = 'active'` + ventana vigente. | Todas las filas de su negocio. | Todas. | CRUD de su negocio. | CRUD todos. |
| `about` | Negocio activo. Opcional: tambien modulo about habilitado si se decide llevar modulos a RLS. | Fila de su negocio. | Todas. | Upsert/update de su negocio. | CRUD todos. |
| `faq` | Negocio activo + `is_active = true`. | Todas las filas de su negocio. | Todas. | CRUD de su negocio. | CRUD todos. |
| `gallery_albums` | Negocio activo + `is_active = true`. | Todas las filas de su negocio. | Todas. | CRUD de su negocio. | CRUD todos. |
| `gallery_photos` | Negocio activo + foto activa + album padre activo. | Todas las filas de su negocio. | Todas. | CRUD de su negocio y album del mismo negocio. | CRUD todos. |
| `blog` | Negocio activo + `is_published = true` + `published_at IS NOT NULL` + `published_at <= current date` en zona de negocio/plataforma. | Todas las filas de su negocio. | Todas. | CRUD de su negocio. | CRUD todos. |

## Estrategia recomendada de migracion

1. No editar migraciones antiguas. Crear una migracion incremental nueva, por ejemplo `005_public_read_rls.sql`.
2. Agregar helper `is_platform_admin()` para no repetir subqueries y para centralizar la semantica de plataforma.
3. Considerar helper `is_active_business(bid uuid)` para checks publicos de contenido. Debe ser `SECURITY DEFINER STABLE` si se usa desde policies y consulta `businesses`.
4. Dropear y recrear las policies SELECT actuales con `USING (true)`:
   - `businesses_select_public`
   - `catalog_pages_select_public`
   - `catalog_categories_select_public`
   - `catalog_products_select_public`
   - `promotions_select_public`
   - `about_select_public`
   - `faq_select_public`
   - `gallery_albums_select_public`
   - `gallery_photos_select_public`
   - `blog_select_public`
5. Reemplazar cada SELECT por una policy que combine lectura publica y lectura admin:
   - patron: `(condicion_publica) OR is_business_admin(business_id)`.
   - para `businesses`: `is_active OR is_business_admin(id)`.
6. Mantener las policies de escritura existentes en Fase 3.2 para reducir riesgo, salvo que se decida abordar tambien integridad multi-tenant de padres.
7. En Fase 3.3, endurecer `WITH CHECK` de tablas con padre:
   - `catalog_categories`: `catalog_id` debe pertenecer al mismo `business_id`.
   - `catalog_products`: `category_id` debe pertenecer al mismo `business_id`.
   - `gallery_photos`: `album_id` debe pertenecer al mismo `business_id`.
8. Revisar si `business_admins_select_self` debe ampliarse a `user_id = auth.uid() OR is_platform_admin()` para futuras pantallas de superadmin.
9. Revisar permisos `EXECUTE` de helpers `SECURITY DEFINER` si se quiere evitar uso RPC directo.

## Riesgos de romper admin al limitar lectura publica

- `getAdminContext(slug)` usa `resolveBusinessBySlug(slug)`. Si `businesses` se limita a `is_active = true` sin excepcion admin, admins no podrian entrar a negocios inactivos. La policy debe incluir `OR is_business_admin(id)`.
- Las paginas admin leen listas sin filtros de visibilidad publica. Si se limita SELECT solo a condiciones publicas, el admin dejaria de ver borradores, inactivos, productos no disponibles, promociones pausadas o posts futuros. Cada tabla de contenido debe incluir `OR is_business_admin(business_id)`.
- Platform admin depende de que `is_business_admin` incluya `platform_admins`, o de policies explicitas con `is_platform_admin()`.
- Las paginas publicas ya filtran negocio activo, pero algunos `generateMetadata` y layouts resuelven negocio por slug. La policy de `businesses` debe devolver negocios activos a `anon` y todos los negocios al admin correspondiente.

## Como Fase 2 ayuda a definir RLS publica

- Catalogo publico: usar como base `catalog_pages.is_active`, `catalog_categories.is_active`, `catalog_products.is_available` y pertenencia a padres activos.
- Promociones publicas: usar `status = 'active'`, `starts_at IS NULL OR starts_at <= now()`, `ends_at IS NULL OR ends_at >= now()`.
- Blog publico: usar `is_published = true`, `published_at IS NOT NULL` y `published_at <= ((now() AT TIME ZONE 'America/Havana')::date)` para igualar el helper actual.
- Galeria publica: usar `gallery_albums.is_active`, `gallery_photos.is_active` y pertenencia a album activo.
- FAQ publica: usar `faq.is_active`.
- About publico: no tiene flag propio; por ahora dependeria de negocio activo. Si los modulos deben ser autoridad de publicacion, habria que decidir si RLS debe leer `businesses.modules`.

## Validacion

- `npm.cmd run lint`: OK.
  - Salida relevante: `eslint`.
- `npm.cmd run build`: OK.
  - Salida relevante: `Next.js 16.2.4 (Turbopack)`, compiled successfully, TypeScript OK, static pages generated OK.
- `git status --short`:
  - `?? docs/audits/phase-3-rls-audit.md`
- `git diff --stat`:
  - Sin salida. El archivo es nuevo y no trackeado, por eso no aparece en `git diff --stat`.
- `git diff`:
  - Sin salida. El archivo es nuevo y no trackeado, por eso no aparece en `git diff`.
