# Auditoria Fase 2.1: services publicos y rutas publicas

Fecha: 2026-05-17

Alcance:
- Services en `src/services`.
- Rutas bajo `src/app/negocios/[slug]/(public)`.
- Campos reales de visibilidad segun mappers y migraciones.

Restricciones aplicadas: no se modifico logica de negocio, services, paginas, admin, mutations, Supabase, RLS, migraciones, `package.json` ni roadmap.

## Resumen ejecutivo

La separacion public/admin todavia no esta completa. La mayoria de services estan nombrados como API publica, pero varios devuelven datos de lectura amplia y dependen de que cada pagina filtre correctamente.

Hallazgos principales:
- `business.service.ts` expone negocios inactivos en `resolveBusinessBySlug`, `getAllBusinesses` y `getBusinessById`; las rutas publicas quedan protegidas por `src/app/negocios/[slug]/(public)/layout.tsx`, pero el service no expresa lectura publica.
- `catalog.service.ts` filtra catalogos y categorias activos, pero `getProducts` y `getProductBySlug` no filtran `is_available`.
- `src/app/negocios/[slug]/(public)/catalog/[catalogSlug]/page.tsx` muestra productos no disponibles en el listado normal porque usa `getProducts` directamente; solo los destacados filtran disponibilidad.
- `promotions.service.ts` tiene `getPromotions` sin filtro publico y `getActivePromotions` filtra en memoria. Ademas, `getPromotionStatus` solo respeta `status === 'paused'`; un registro con `status = 'expired'` o `status = 'upcoming'` puede resolverse como `active` si las fechas no lo contradicen.
- `src/app/negocios/[slug]/(public)/promotions/page.tsx` muestra todas las promociones, incluidas pausadas, vencidas o futuras.
- `blog.service.ts` filtra `is_published = true`, pero no filtra `published_at <= hoy`; puede mostrar posts programados si estan marcados como publicados.
- `gallery.service.ts` filtra albums y fotos activos, pero la vista general de galeria puede mostrar fotos activas pertenecientes a albums inactivos, porque `getGalleryPhotos` no cruza contra albums activos.
- `faq.service.ts`, `getCatalogs`, `getCategories` y `getGalleryAlbums` ya aplican filtros publicos basicos en DB.

## Campos reales de visibilidad

| Modulo | Tabla | Campos relevantes | Fuente |
| --- | --- | --- | --- |
| Business | `businesses` | `is_active` | `001_businesses.sql`, `business.mapper.ts` |
| Catalogos | `catalog_pages` | `is_active` | `002_pages_modules.sql`, `catalog.mapper.ts` |
| Categorias | `catalog_categories` | `is_active` | `002_pages_modules.sql`, `catalog.mapper.ts` |
| Productos | `catalog_products` | `is_available`, `is_featured` | `002_pages_modules.sql`, `catalog.mapper.ts` |
| Promociones | `promotions` | `status`, `starts_at`, `ends_at` | `002_pages_modules.sql`, `promotion.mapper.ts` |
| Blog | `blog` | `is_published`, `published_at` | `002_pages_modules.sql`, `blog.mapper.ts` |
| FAQ | `faq` | `is_active` | `002_pages_modules.sql`, `faq.mapper.ts` |
| Galeria albums | `gallery_albums` | `is_active` | `002_pages_modules.sql`, `gallery.mapper.ts` |
| Galeria fotos | `gallery_photos` | `is_active` | `002_pages_modules.sql`, `gallery.mapper.ts` |
| About | `about` | ninguno especifico de publicacion | `002_pages_modules.sql`, `about.mapper.ts` |

## Auditoria de services

### `src/services/about.service.ts`

Funciones exportadas:
- `getAboutContent(businessId)`

Tablas consultadas:
- `about`

Filtros actuales:
- `business_id = businessId`
- `maybeSingle()`

Visibilidad:
- Filtra por `business_id`: si.
- Filtra por activo/publicado/disponible: no hay campo en tabla.
- Puede exponer contenido inactivo en rutas publicas: no aplica a nivel de fila; depende de que el negocio este activo y el modulo `about` este habilitado.

Paginas publicas que lo usan:
- `src/app/negocios/[slug]/(public)/page.tsx`
- `src/app/negocios/[slug]/(public)/about/page.tsx`

### `src/services/blog.service.ts`

Funciones exportadas:
- `getPosts(businessId)`
- `getPostBySlug(businessId, slug)`

Tablas consultadas:
- `blog`

Filtros actuales:
- `getPosts`: `business_id = businessId`, `is_published = true`, orden `published_at desc`.
- `getPostBySlug`: `business_id = businessId`, `slug = slug`, `is_published = true`, `maybeSingle()`.

Visibilidad:
- Filtra por `business_id`: si.
- Filtra por activo/publicado/disponible: si, `is_published = true`.
- No filtra por fecha efectiva: `published_at` puede ser futuro o null.
- Puede exponer contenido inactivo en rutas publicas: no expone `is_published = false`, pero si puede exponer posts programados si `is_published = true` y `published_at` esta en el futuro.

Paginas publicas que lo usan:
- `src/app/negocios/[slug]/(public)/blog/page.tsx`
- `src/app/negocios/[slug]/(public)/blog/[post]/page.tsx`

### `src/services/business.service.ts`

Funciones exportadas:
- `resolveBusinessBySlug(slug)`
- `getAllBusinesses()`
- `getBusinessById(id)`
- `listActiveBusinesses()`

Tablas consultadas:
- `businesses`

Filtros actuales:
- `resolveBusinessBySlug`: `slug = slug`, sin `is_active`.
- `getAllBusinesses`: sin filtro, orden por `name`.
- `getBusinessById`: deriva de `getAllBusinesses`, busca por `id` en memoria.
- `listActiveBusinesses`: deriva de `getAllBusinesses`, filtra `b.isActive` en memoria y mapea a `BusinessDirectoryItem`.

Visibilidad:
- Filtra por `business_id`: no aplica.
- Filtra por activo/publicado/disponible: solo `listActiveBusinesses`, en memoria.
- Puede exponer contenido inactivo en rutas publicas: si, si un caller publico usa `resolveBusinessBySlug`, `getAllBusinesses` o `getBusinessById` sin verificar `isActive`. Hoy las rutas publicas de tenant quedan cubiertas por `(public)/layout.tsx`, que hace `notFound()` cuando `!business || !business.isActive`.

Paginas publicas que lo usan:
- `src/app/(platform)/page.tsx` usa `listActiveBusinesses`.
- `src/app/negocios/[slug]/layout.tsx` usa `resolveBusinessBySlug`.
- Todas las paginas bajo `src/app/negocios/[slug]/(public)` usan directa o indirectamente `resolveBusinessBySlug`.

### `src/services/catalog.service.ts`

Funciones exportadas:
- `getCatalogs(businessId)`
- `getCatalogBySlug(businessId, slug)`
- `getCategories(businessId)`
- `getCategoriesByCatalog(businessId, catalogId)`
- `getProducts(businessId)`
- `getProductBySlug(businessId, productSlug)`
- `getFeaturedProducts(businessId, categoryIds?)`
- `getProductsByCategory(businessId, categoryId)`

Tablas consultadas:
- `catalog_pages`
- `catalog_categories`
- `catalog_products`

Filtros actuales:
- `getCatalogs`: `business_id = businessId`, `is_active = true`, orden `sort_order`.
- `getCatalogBySlug`: deriva de `getCatalogs`, busca `slug` en memoria.
- `getCategories`: `business_id = businessId`, `is_active = true`, orden `sort_order`.
- `getCategoriesByCatalog`: deriva de `getCategories`, filtra `catalogId` en memoria.
- `getProducts`: `business_id = businessId`, orden `sort_order`; no filtra `is_available`.
- `getProductBySlug`: `business_id = businessId`, `slug = productSlug`; no filtra `is_available`.
- `getFeaturedProducts`: deriva de `getProducts`, filtra `isFeatured` e `isAvailable` en memoria; opcionalmente por `categoryIds`.
- `getProductsByCategory`: deriva de `getProducts`, filtra `categoryId` e `isAvailable` en memoria.

Visibilidad:
- Filtra por `business_id`: si en queries base.
- Filtra por activo/publicado/disponible: catalogos y categorias si; productos solo en helpers derivados, no en `getProducts` ni `getProductBySlug`.
- Puede exponer contenido inactivo en rutas publicas: si para productos no disponibles cuando un caller publico usa `getProducts` o `getProductBySlug`. Tambien podria exponer productos de categorias inactivas si se consume `getProducts` sin cruzar con categorias activas.

Paginas publicas que lo usan:
- `src/app/negocios/[slug]/(public)/layout.tsx` usa `getCatalogs`.
- `src/app/negocios/[slug]/(public)/catalog/page.tsx` usa `getCatalogs`.
- `src/app/negocios/[slug]/(public)/catalog/[catalogSlug]/page.tsx` usa `getCatalogBySlug`, `getCategoriesByCatalog`, `getProducts`.

### `src/services/faq.service.ts`

Funciones exportadas:
- `getFaqItems(businessId)`

Tablas consultadas:
- `faq`

Filtros actuales:
- `business_id = businessId`
- `is_active = true`
- orden por `category` y `sort_order`

Visibilidad:
- Filtra por `business_id`: si.
- Filtra por activo/publicado/disponible: si, `is_active = true`.
- Puede exponer contenido inactivo en rutas publicas: no segun el campo actual.

Paginas publicas que lo usan:
- `src/app/negocios/[slug]/(public)/faq/page.tsx`

### `src/services/gallery.service.ts`

Funciones exportadas:
- `getGalleryAlbums(businessId)`
- `getGalleryPhotos(businessId)`
- `getPhotosByAlbum(businessId, albumId)`

Tablas consultadas:
- `gallery_albums`
- `gallery_photos`

Filtros actuales:
- `getGalleryAlbums`: `business_id = businessId`, `is_active = true`, orden `sort_order`.
- `getGalleryPhotos`: `business_id = businessId`, `is_active = true`, orden `sort_order`.
- `getPhotosByAlbum`: deriva de `getGalleryPhotos`, filtra `albumId` en memoria.

Visibilidad:
- Filtra por `business_id`: si.
- Filtra por activo/publicado/disponible: albums y fotos filtran `is_active = true`.
- Puede exponer contenido inactivo en rutas publicas: si, en la vista general de galeria puede exponer fotos activas de albums inactivos porque `getGalleryPhotos` no valida que `album_id` pertenezca a un album activo.

Paginas publicas que lo usan:
- `src/app/negocios/[slug]/(public)/gallery/page.tsx`

### `src/services/promotions.service.ts`

Funciones exportadas:
- `getPromotions(businessId)`
- `getPromotionById(businessId, id)`
- `getActivePromotions(businessId)`
- `getPromotionStatus(promotion)`
- `isPromotionActive(promotion)`

Tablas consultadas:
- `promotions`

Filtros actuales:
- `getPromotions`: `business_id = businessId`, orden `sort_order`; no filtra `status`, `starts_at` ni `ends_at`.
- `getPromotionById`: deriva de `getPromotions`, filtra `id` en memoria.
- `getActivePromotions`: deriva de `getPromotions`, filtra en memoria `getPromotionStatus(p) === 'active'`.
- `getPromotionStatus`: devuelve `paused` solo si `status === 'paused'`; luego calcula `expired` por `endsAt < now`, `upcoming` por `startsAt > now`, y `active` en el resto.

Visibilidad:
- Filtra por `business_id`: si.
- Filtra por activo/publicado/disponible: `getPromotions` no; `getActivePromotions` si, pero en memoria.
- Puede exponer contenido inactivo en rutas publicas: si. La pagina publica de promociones usa `getPromotions` y renderiza todas. La home usa `getActivePromotions`, pero por la logica actual un registro con `status = 'expired'` o `status = 'upcoming'` puede resolverse como `active` si las fechas no lo impiden.

Paginas publicas que lo usan:
- `src/app/negocios/[slug]/(public)/page.tsx` usa `getActivePromotions`.
- `src/app/negocios/[slug]/(public)/promotions/page.tsx` usa `getPromotions` y `getPromotionStatus`.

### `src/services/index.ts`

Funciones exportadas:
- Reexporta todos los services anteriores y helpers de promociones.

Tablas consultadas:
- Ninguna directamente.

Visibilidad:
- No aplica filtros propios; hereda el comportamiento de cada service.

Paginas publicas que lo usan:
- Todas las rutas publicas importan desde `@/services`.

## Auditoria de paginas publicas

### `src/app/negocios/[slug]/(public)/layout.tsx`

Services:
- `resolveBusinessBySlug`
- `getCatalogs`

Modulos verificados:
- `cart` feature.
- `whatsappOrdering` feature.

Contenido mostrado:
- Header, footer, shell de carrito y dropdown de catalogos.

Riesgo publico:
- Bloquea negocios inactivos con `notFound()`.
- Los catalogos del header vienen filtrados por `is_active = true`.

### `src/app/negocios/[slug]/(public)/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getAboutContent`
- `getActivePromotions`

Modulos verificados:
- `resolveActiveSections(business)`.
- Carga about solo si esta activa la seccion `highlights`.
- Carga promociones solo si esta activa la seccion `promotions`.

Contenido mostrado:
- Hero con datos del negocio.
- Secciones activas: highlights/about, promociones, horarios, ubicacion, WhatsApp, etc. segun resolver.

Riesgo publico:
- El layout publico bloquea negocio inactivo.
- About no tiene campo de publicacion.
- Promociones dependen de `getActivePromotions`; riesgo por `getPromotionStatus` ignorando `status = 'expired'` y `status = 'upcoming'`.

### `src/app/negocios/[slug]/(public)/about/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getAboutContent`

Modulos verificados:
- Page module `about`.
- Section module `whatsapp_cta`.

Contenido mostrado:
- Historia, imagen del equipo, mision, diferenciadores, ubicacion, telefono, email, redes, horarios y CTA WhatsApp.

Riesgo publico:
- El layout publico bloquea negocio inactivo.
- No hay campo de publicacion para `about`; si el modulo esta habilitado, todo el contenido de `about` se considera publico.

### `src/app/negocios/[slug]/(public)/blog/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getPosts`

Modulos verificados:
- Page module `blog`.

Contenido mostrado:
- Listado de posts publicados.

Riesgo publico:
- No muestra `is_published = false`.
- Puede mostrar posts con `published_at` futuro si `is_published = true`.

### `src/app/negocios/[slug]/(public)/blog/[post]/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getPostBySlug`

Modulos verificados:
- Page module `blog`.

Contenido mostrado:
- Detalle de post: fecha, titulo, resumen, autor, cuerpo y tags.

Riesgo publico:
- No muestra `is_published = false`.
- Puede mostrar posts con `published_at` futuro si `is_published = true`.

### `src/app/negocios/[slug]/(public)/catalog/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getCatalogs`

Modulos verificados:
- Page module `catalog`.

Contenido mostrado:
- Selector de catalogos; redirige si hay un solo catalogo.

Riesgo publico:
- Solo lista catalogos con `is_active = true`.

### `src/app/negocios/[slug]/(public)/catalog/[catalogSlug]/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getCatalogBySlug`
- `getCategoriesByCatalog`
- `getProducts`

Modulos verificados:
- Page module `catalog`.
- Section module `whatsapp_cta`.
- Feature modules `cart` y `whatsappOrdering`.

Contenido mostrado:
- Catalogo activo, categorias activas, productos destacados disponibles, listado normal de productos, CTA WhatsApp.

Riesgo publico:
- El catalogo y categorias estan filtrados por `is_active = true`.
- Los productos destacados filtran `isAvailable`.
- El listado normal muestra todos los productos de categorias activas, incluso `is_available = false`.
- Si existieran productos asociados a categorias inactivas, no se mostrarian en esta pagina porque el agrupado se construye desde categorias activas.

### `src/app/negocios/[slug]/(public)/contact/page.tsx`

Services:
- `resolveBusinessBySlug`

Modulos verificados:
- Page module `contact`.

Contenido mostrado:
- WhatsApp, telefono, email, direccion, redes y horarios del negocio.

Riesgo publico:
- El layout publico bloquea negocio inactivo.
- No hay campos por canal para ocultar contacto individualmente; si el dato existe y el modulo esta habilitado, se publica.

### `src/app/negocios/[slug]/(public)/faq/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getFaqItems`

Modulos verificados:
- Page module `faq`.
- Section module `whatsapp_cta`.

Contenido mostrado:
- FAQs activas y CTA WhatsApp.

Riesgo publico:
- No muestra `is_active = false`.

### `src/app/negocios/[slug]/(public)/gallery/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getGalleryAlbums`
- `getGalleryPhotos`
- `getPhotosByAlbum`

Modulos verificados:
- Page module `gallery`.
- Section module `whatsapp_cta`.

Contenido mostrado:
- Albums activos, fotos activas por album o todas las fotos activas.

Riesgo publico:
- Albums y fotos filtran `is_active = true`.
- Con `?album=slug`, solo se aceptan albums activos.
- Sin filtro de album, `getGalleryPhotos` puede mostrar fotos activas que pertenecen a albums inactivos.

### `src/app/negocios/[slug]/(public)/promotions/page.tsx`

Services:
- `resolveBusinessBySlug`
- `getPromotions`
- `getPromotionStatus`

Modulos verificados:
- Page module `promotions`.
- Section module `whatsapp_cta`.

Contenido mostrado:
- Todas las promociones del negocio, enriquecidas con estado calculado y rango de fechas.

Riesgo publico:
- Muestra promociones pausadas, vencidas y futuras.
- `activeCount` puede contar como activas promociones con `status = 'expired'` o `status = 'upcoming'` cuando las fechas no contradicen ese resultado.

## Reglas publicas recomendadas por modulo

### Business / contacto

Regla:
- Las rutas publicas solo deben resolver negocios con `is_active = true`.
- La lectura admin puede seguir accediendo a negocios inactivos.

Implementacion recomendada:
- Crear `resolvePublicBusinessBySlug(slug)` con filtro DB `.eq('is_active', true)`.
- Mantener `resolveBusinessBySlug` como lectura admin/neutral o renombrarla en una fase posterior para evitar ambiguedad.

### Catalogos

Regla:
- Publico: `catalog_pages.is_active = true`.
- Admin: todos los catalogos del negocio.

Implementacion recomendada:
- Mantener filtro en DB.
- Crear nombres explicitos: `getPublicCatalogs`, `getPublicCatalogBySlug`.

### Categorias

Regla:
- Publico: `catalog_categories.is_active = true`.
- Una categoria publica debe pertenecer a un catalogo publico.

Implementacion recomendada:
- Mantener `is_active` en DB.
- Para garantizar pertenencia a catalogo publico, filtrar por `catalog_id` desde catalogo ya resuelto como publico o usar query relacional cuando convenga.
- Crear `getPublicCategoriesByCatalog`.

### Productos

Regla:
- Publico visible: producto perteneciente a una categoria publica y con `is_available = true`.
- Si el negocio quiere mostrar productos agotados, debe definirse una regla explicita distinta; hoy el objetivo de Fase 2 pide contenido visible/publicable, por lo que `is_available = true` debe ser el default publico.

Implementacion recomendada:
- Crear `getPublicProductsByCategory` y `getPublicFeaturedProducts`.
- Mover `is_available = true` a query DB para listados publicos.
- Mantener una lectura admin sin filtro para poder gestionar productos no disponibles.
- Evitar que paginas publicas usen `getProducts` directamente.

### Promociones

Regla:
- Publico visible: promocion con `status = 'active'`, `starts_at IS NULL OR starts_at <= now`, `ends_at IS NULL OR ends_at >= now`.
- Promociones `paused`, `expired` y `upcoming` no deben aparecer en rutas publicas, salvo una decision de producto explicita.

Implementacion recomendada:
- Crear `getPublicActivePromotions`.
- Mover a DB los filtros simples: `status = 'active'`, `starts_at <= now OR starts_at IS NULL`, `ends_at >= now OR ends_at IS NULL`.
- Mantener helper de dominio para UI/admin, pero corregirlo para respetar `status = 'expired'` y `status = 'upcoming'`.
- Si las reglas JSONB hacen referencia a productos/categorias, validar en memoria que esos productos/categorias sigan siendo publicos cuando esa validacion sea necesaria.

### Blog

Regla:
- Publico visible: `is_published = true` y `published_at <= fecha actual`.
- Un post sin `published_at` no deberia publicarse si se usa `published_at` como fecha efectiva.

Implementacion recomendada:
- Crear `getPublicPosts` y `getPublicPostBySlug`.
- Mover a DB `is_published = true`.
- Mover a DB `published_at <= today` cuando se defina si la zona efectiva es UTC o `America/Havana`.
- Decidir si `published_at IS NULL` se excluye en publico.

### FAQ

Regla:
- Publico visible: `faq.is_active = true`.

Implementacion recomendada:
- Mantener filtro en DB.
- Renombrar/duplicar como `getPublicFaqItems` para separar de lectura admin.

### Galeria

Regla:
- Publico visible: `gallery_albums.is_active = true` y `gallery_photos.is_active = true`.
- Una foto publica debe pertenecer a un album publico.

Implementacion recomendada:
- Crear `getPublicGalleryAlbums`, `getPublicGalleryPhotos`, `getPublicPhotosByAlbum`.
- Mantener filtros `is_active` en DB.
- En vista general, cruzar fotos contra albums publicos. Puede ser query relacional o filtro en memoria con el set de album IDs activos.

### About

Regla:
- Publico visible: contenido de `about` solo si negocio activo y page module `about` o seccion dependiente estan habilitados.
- No existe campo de publicacion por fila en `about`.

Implementacion recomendada:
- Crear `getPublicAboutContent` solo como alias semantico si ayuda a separar public/admin.
- No agregar filtros inexistentes.

## Cambios minimos propuestos para Fase 2.2 en adelante

### Fase 2.2: Business y promociones

Prioridad alta por riesgo transversal.

Cambios propuestos:
- Crear `resolvePublicBusinessBySlug`.
- Actualizar `(public)/layout.tsx`, metadata de tenant y paginas publicas para usar lectura publica de negocio.
- Crear `getPublicActivePromotions`.
- Corregir o separar `getPromotionStatus` para respetar `status = 'expired'` y `status = 'upcoming'`.
- Actualizar home y pagina de promociones para no renderizar pausadas, vencidas ni futuras en publico.

### Fase 2.3: Catalogo/productos

Prioridad alta por exposicion directa de productos no disponibles.

Cambios propuestos:
- Crear `getPublicProductsByCategory`, `getPublicFeaturedProducts`, opcionalmente `getPublicCatalogTree`.
- Actualizar `catalog/[catalogSlug]/page.tsx` para dejar de usar `getProducts`.
- Mover `is_available = true` a DB en lecturas publicas.
- Mantener helpers admin/neutrales para panel.

### Fase 2.4: Blog, galeria, FAQ y about

Prioridad media.

Cambios propuestos:
- Blog: crear `getPublicPosts` y `getPublicPostBySlug` con `is_published` y fecha efectiva.
- Galeria: asegurar que fotos de albums inactivos no aparezcan en vista general.
- FAQ: crear alias publico explicito aunque el filtro ya sea correcto.
- About: decidir si basta con el gating por modulo/negocio o si se requiere un campo editorial futuro; no tocar esquema en esta fase.

## Paginas publicas a actualizar primero

Orden recomendado:
1. `src/app/negocios/[slug]/(public)/layout.tsx`: usar business publico activo como guard central.
2. `src/app/negocios/[slug]/(public)/promotions/page.tsx`: dejar de mostrar promociones no publicables.
3. `src/app/negocios/[slug]/(public)/page.tsx`: usar el mismo service publico de promociones activas.
4. `src/app/negocios/[slug]/(public)/catalog/[catalogSlug]/page.tsx`: no usar `getProducts` para render publico.
5. `src/app/negocios/[slug]/(public)/blog/page.tsx` y `blog/[post]/page.tsx`: bloquear posts futuros.
6. `src/app/negocios/[slug]/(public)/gallery/page.tsx`: excluir fotos de albums inactivos.

## Nota sobre RLS

Las policies actuales de lectura publica usan `USING (true)` para las tablas auditadas. Por tanto, la separacion public/admin debe ocurrir en services y queries de aplicacion mientras no se cambie RLS. Esta auditoria no propone cambios de RLS para respetar las restricciones de la tarea.
