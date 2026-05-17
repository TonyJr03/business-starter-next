# Phase 0 Inventory - business-starter-next

## 1. Estado general

`business-starter-next` es una plataforma multi-tenant basada en rutas `/negocios/[slug]`, con Next.js App Router, TypeScript, Supabase/PostgreSQL con RLS, Tailwind CSS y una separacion clara entre lectura publica, panel admin de negocio y panel superadmin.

El codigo de aplicacion vive bajo `src/`. La estructura con `src/app` y `src/proxy.ts` es consistente con Next.js 16: `proxy.ts` esta al mismo nivel que `app` dentro de `src`, y `tsconfig.json` apunta `@/*` a `./src/*`.

Estado de verificacion previo a este inventario:

- `npm run lint` pasa sin errores ni warnings despues del ajuste centralizado de ESLint para argumentos `_`.
- `npm run build` pasa cuando el entorno permite descargar Google Fonts usadas por `next/font/google`.
- No se detectan imports rotos hacia carpetas antiguas fuera de `src/`.

## 2. Estructura del proyecto

### `src/app`

Rutas principales:

- `src/app/layout.tsx`: root layout global, metadata base y fuentes Geist.
- `src/app/(platform)`: directorio publico de negocios en `/`.
- `src/app/negocios/[slug]/layout.tsx`: layout raiz del tenant; resuelve negocio por slug y aplica branding.
- `src/app/negocios/[slug]/(public)`: sitio publico del negocio.
- `src/app/negocios/[slug]/admin/(auth)/login`: login admin del negocio.
- `src/app/negocios/[slug]/admin/(panel)`: panel protegido del negocio.
- `src/app/superadmin/(auth)/login`: login superadmin.
- `src/app/superadmin/(panel)`: panel protegido de plataforma.
- `src/app/forbidden.tsx` y `src/app/not-found.tsx`: paginas globales 403/404.

### `src/services`

Capa de lectura principalmente publica:

- `business.service.ts`
- `catalog.service.ts`
- `promotions.service.ts`
- `about.service.ts`
- `faq.service.ts`
- `gallery.service.ts`
- `blog.service.ts`
- `index.ts` como barrel.

### `src/lib/persistence`

Mappers snake_case -> camelCase:

- `business.mapper.ts`
- `catalog.mapper.ts`
- `promotion.mapper.ts`
- `about.mapper.ts`
- `faq.mapper.ts`
- `gallery.mapper.ts`
- `blog.mapper.ts`
- `index.ts` como barrel.

### `src/lib/admin`

- `context.ts`: `getAdminContext`, `getSuperAdminContext`, tipos de contexto y `MutationResult`.
- `index.ts`: barrel de contexto, schemas y mutations.
- `mutations/`: escritura de negocio, catalogo, promociones, about, FAQ, galeria, blog, branding y modulos.

### `src/lib/modules`

- `resolver.ts`: merge entre `platformDefaults.modules` y overrides `business.modules`; expone `resolveModules`, `resolvePageModule`, `resolveSectionModule`, `resolveFeatureModule` y `resolveActiveSections`.

### `src/lib/branding`

- `resolver.ts`: merge entre `platformDefaults.branding` y `business.branding`; produce CSS custom properties y `data-theme`.

### `src/components`

Agrupado por superficie:

- `admin`: componentes del panel admin (`AdminNav`, headers, alertas, formularios).
- `superadmin`: navegacion y cards del superadmin.
- `platform`: header/footer/cards del directorio.
- `public`: header/footer/nav del sitio tenant.
- `sections`: secciones publicas renderizables.
- `features`: secciones funcionales transversales, como CTA WhatsApp.
- `cart`: carrito client-side con `localStorage` por `businessId`.
- `ui`: primitives compartidas.

### `supabase/migrations`

Migraciones existentes:

- `001_businesses.sql`: tabla `businesses`, trigger `set_updated_at`, RLS inicial.
- `002_pages_modules.sql`: tablas de contenido (`catalog_pages`, `catalog_categories`, `catalog_products`, `promotions`, `about`, `faq`, `gallery_albums`, `gallery_photos`, `blog`) con RLS inicial amplia.
- `003_platform_admins.sql`: tabla `platform_admins` y policy de insert de negocios para superadmins.
- `004_business_admins.sql`: tabla `business_admins`, funcion `is_business_admin(bid)` y tightening de policies de escritura.

### `docs`

Documentos actuales:

- `technical-overview.md`
- `data-flow.md`
- `saas-product-vision.md`
- `roadmap-consolidacion-business-starter-next.md`
- `audits/phase-0-inventory.md` (este documento)

## 3. Flujo publico del tenant

### Entrada `/negocios/[slug]`

`src/app/negocios/[slug]/layout.tsx` resuelve el negocio con `resolveBusinessBySlug(slug)`. Si no existe, llama a `notFound()`. Si existe, aplica branding con:

- `resolveBrandVars(business)`: CSS variables.
- `resolveThemeKey(business)`: atributo `data-theme`.

Riesgo: actualmente este layout solo comprueba existencia, no `business.isActive`. Por tanto, un negocio inactivo pero existente puede seguir renderizando su arbol publico si las policies y services lo devuelven.

### Layout publico

`src/app/negocios/[slug]/(public)/layout.tsx`:

- vuelve a resolver `business` via cache de React.
- carga catalogos activos con `getCatalogs(business.id)` para el header.
- resuelve features `cart` y `whatsappOrdering`.
- monta `Header`, `CartShell`, `main` y `Footer`.

### Paginas publicas por modulo

Patron general:

- resolver negocio por slug.
- resolver modulo de pagina con `resolvePageModule`.
- si el modulo esta deshabilitado, `notFound()`.
- cargar datos via services.

Paginas existentes:

- Home: `src/app/negocios/[slug]/(public)/page.tsx`, usa `resolveActiveSections`, `HeroSection`, `SectionRenderer`, `getAboutContent`, `getActivePromotions`.
- Catalogo entry: `/catalog`, verifica modulo y catalogos activos; si hay un solo catalogo, redirige a `/catalog/[catalogSlug]`.
- Catalogo detalle: `/catalog/[catalogSlug]`, carga catalogo activo, categorias activas y productos.
- Promociones: `/promotions`, verifica modulo y usa promociones activas.
- About: `/about`, verifica modulo y usa `getAboutContent`.
- FAQ: `/faq`, verifica modulo y usa FAQ activa.
- Galeria: `/gallery`, verifica modulo y usa albums/fotos activos.
- Blog: `/blog`, verifica modulo y usa posts publicados.
- Blog post: `/blog/[post]`, verifica modulo y post publicado.
- Contacto: `/contact`, usa datos del negocio.

### Business por slug

`resolveBusinessBySlug` viene de `src/services/business.service.ts` y hace:

- `from('businesses').select('*').eq('slug', slug).maybeSingle()`
- no filtra `is_active`.

Para negocio publico, el 404 de negocios inactivos deberia aplicarse lo mas arriba posible en `src/app/negocios/[slug]/layout.tsx` o, si se permite admin de negocios inactivos, en el subarbol publico `src/app/negocios/[slug]/(public)/layout.tsx`. La opcion mas segura para no afectar al admin es hacerlo en el layout publico y en metadata publica; si el requisito es ocultar todo el tenant, entonces en el tenant layout raiz.

### Modulos y branding

- Modulos: `resolveModules` mezcla defaults de plataforma con `business.modules`; paginas publicas usan `resolvePageModule` y nav/header/footer filtran por `enabled`.
- Home sections: `resolveActiveSections` filtra por `enabled` y dependencias como `business.hours`, `business.location`, `business.whatsapp` o modulos relacionados.
- Branding: `resolveBrandVars` mezcla defaults y override del negocio; el tenant layout inyecta CSS variables.

## 4. Flujo admin del negocio

### Login

`src/app/negocios/[slug]/admin/(auth)/login/page.tsx`:

- si `getAdminContext(slug)` devuelve OK, redirige a `/negocios/${slug}/admin`.
- si no, muestra formulario de login.
- muestra el nombre del negocio si existe, pero no bloquea negocio inexistente.

`src/actions/auth.ts` contiene `loginAction` y `logoutAction`.

### Layout protegido

`src/app/negocios/[slug]/admin/(panel)/layout.tsx`:

- llama a `getAdminContext(slug)`.
- si no hay sesion, redirige a `/negocios/${slug}/admin/login`.
- si no autorizado, `forbidden()`.
- si negocio no encontrado, `notFound()`.
- carga `resolveModules(business)` para construir `enabledPages` de `AdminNav`.

### `getAdminContext`

`src/lib/admin/context.ts` valida:

- usuario autenticado via `supabase.auth.getUser()`.
- negocio existente via `resolveBusinessBySlug(slug)`.
- membresia en `business_admins` o rol en `platform_admins`.

Nota: como `resolveBusinessBySlug` no filtra `is_active`, un admin puede operar un negocio inactivo. Esto puede ser correcto para reactivacion/configuracion, pero debe quedar decidido explicitamente.

### AdminNav

`src/components/admin/AdminNav.tsx` recibe `enabledPages` y muestra enlaces del panel segun modulos activos, ademas de negocio, usuario y logout.

### Patron de paginas admin

Las paginas admin:

- vuelven a llamar `getAdminContext(slug)` como defensa por pagina.
- leen directamente desde Supabase con `ctx.supabase`.
- filtran por `ctx.businessId` en listados y detalle de entidades raiz.
- usan mappers para convertir rows antes de pasar datos a formularios.

Modulos existentes:

- `business`: ajustes de negocio.
- `catalog`: catalogos, categorias y productos.
- `promotions`: promociones.
- `about`: contenido about con upsert.
- `faq`: items FAQ.
- `gallery`: albums y fotos.
- `blog`: posts.

### Patron de Server Actions

Las actions bajo `src/app/negocios/[slug]/admin/(panel)/**/actions.ts`:

- usan `'use server'`.
- reciben `slug` y, en rutas anidadas, ids padre desde `bind`.
- llaman `getAdminContext(slug)`.
- parsean `FormData` con schemas Zod exportados desde `src/lib/admin`.
- llaman mutations.
- hacen `revalidatePath(`/negocios/${slug}`, 'layout')`.
- redirigen con query param de estado.

## 5. Flujo superadmin

### Login y layout

`src/app/superadmin/(auth)/login/page.tsx` redirige a `/superadmin` si `getSuperAdminContext()` es OK. El formulario usa `superadminLoginAction`.

`src/app/superadmin/(panel)/layout.tsx`:

- llama `getSuperAdminContext()`.
- sin sesion: redirect a `/superadmin/login`.
- sin rol: `forbidden()`.
- monta `SuperAdminNav`.

### `getSuperAdminContext`

Valida:

- usuario autenticado.
- fila en `platform_admins`.

### Gestion de negocios

Implementado:

- listado de negocios: `/superadmin/businesses`.
- crear negocio: `/superadmin/businesses/new`.
- editar negocio: `/superadmin/businesses/[id]`.
- eliminar negocio: action `deleteBusinessAction`.
- gestion de modulos: `/superadmin/businesses/[id]/modules`.
- gestion de branding: `/superadmin/businesses/[id]/branding`.

Las actions usan `getSuperAdminContext`, mutations con cliente Supabase del usuario autenticado, `revalidatePath` y `redirect`.

### Gestion de admins de negocio

Existe a nivel schema/RLS:

- tabla `business_admins`.
- policies para que platform admins inserten/eliminen membresias.
- `getAdminContext` respeta `business_admins`.

No se detecta UI ni Server Actions de superadmin para crear, listar, asignar o revocar admins de negocio. Por ahora la asignacion parece manual/externa.

## 6. Services

### Funciones existentes

`business.service.ts`:

- `resolveBusinessBySlug`
- `getAllBusinesses`
- `getBusinessById`
- `listActiveBusinesses`

`catalog.service.ts`:

- `getCatalogs`
- `getCatalogBySlug`
- `getCategories`
- `getCategoriesByCatalog`
- `getProducts`
- `getProductBySlug`
- `getFeaturedProducts`
- `getProductsByCategory`

`promotions.service.ts`:

- `getPromotions`
- `getPromotionById`
- `getActivePromotions`
- `getPromotionStatus`
- `isPromotionActive`

`about.service.ts`:

- `getAboutContent`

`faq.service.ts`:

- `getFaqItems`

`gallery.service.ts`:

- `getGalleryAlbums`
- `getGalleryPhotos`
- `getPhotosByAlbum`

`blog.service.ts`:

- `getPosts`
- `getPostBySlug`

### Lectura publica vs admin

La lectura publica usa services. La lectura admin evita services y consulta directamente via `ctx.supabase` para ver contenido inactivo/no publicado y operar con contexto autenticado.

Esto es correcto como separacion conceptual, pero algunos services exportados son mas amplios de lo que su nombre "publico" sugiere.

### Posible exposicion de contenido inactivo

Riesgos detectados:

- `resolveBusinessBySlug` y `getAllBusinesses` devuelven negocios aunque `is_active=false`.
- `getProducts` no filtra `is_available=true`. Las paginas publicas que usan `getProducts` deben filtrar localmente; `fetchProductsByCategory` y `fetchFeaturedProducts` si filtran disponibilidad, pero `/catalog/[catalogSlug]` carga todos los productos y depende del render posterior.
- `getProductBySlug` no filtra `is_available=true`.
- `getPromotions` devuelve todas las promociones; `getActivePromotions` filtra en memoria. Usar la funcion equivocada en publico expone pausadas/futuras/expiradas.
- `getAboutContent` no tiene flag de activacion propio; depende solo del modulo.

### RLS publica

Las policies publicas de Supabase usan `USING (true)` para lectura, por lo que la proteccion de contenido publico depende de filtros en services/paginas. Esto es un punto critico para la siguiente fase de seguridad.

## 7. Persistence mappers

Mappers existentes y cobertura:

- `business.mapper.ts`: `businesses`.
- `catalog.mapper.ts`: `catalog_pages`, `catalog_categories`, `catalog_products`.
- `promotion.mapper.ts`: `promotions`.
- `about.mapper.ts`: `about`.
- `faq.mapper.ts`: `faq`.
- `gallery.mapper.ts`: `gallery_albums`, `gallery_photos`.
- `blog.mapper.ts`: `blog`.

La conversion snake_case -> camelCase esta centralizada y en general consistente:

- `short_description` -> `shortDescription`.
- `sort_order` -> `sortOrder`.
- `is_active` -> `isActive`.
- `image_url` -> `imageUrl`.
- `published_at` -> `publishedAt`.
- `business_id`, `catalog_id`, `category_id`, `album_id` se transforman donde el dominio los necesita.

Inconsistencias/riesgos:

- `ProductRow.money` asume que `row.money.amount` y `row.money.currency` existen. La DB tiene default JSONB, pero no hay constraint de shape.
- Algunos tipos row aceptan JSONB tipado fuerte desde DB sin validacion runtime (`branding`, `modules`, `contact`, `location`, `hours`, `rules`).
- La documentacion antigua menciona `blog_posts`, pero el mapper real usa tabla `blog`.
- No hay mapper para `business_admins` ni `platform_admins`, porque se consultan como tablas de autorizacion simples.

## 8. Admin mutations y Server Actions

### Mutations existentes

- `business.mutation.ts`: `updateBusiness`, `createBusiness`, `updateBusinessById`, `deleteBusiness`.
- `catalog.mutation.ts`: CRUD de catalog pages, categories y products.
- `promotions.mutation.ts`: CRUD de promociones.
- `about.mutation.ts`: upsert de about.
- `faq.mutation.ts`: CRUD de FAQ.
- `gallery.mutation.ts`: CRUD de albums y fotos.
- `blog.mutation.ts`: CRUD de posts.
- `modules.mutation.ts`: update de `businesses.modules`.
- `branding.mutation.ts`: update de `businesses.branding`.

### Validacion Zod

Las mutations definen schemas Zod para:

- campos obligatorios y maximos de longitud.
- numeros con `z.coerce.number()`.
- UUID de `categoryId` en producto.
- enums simples (`promotion.status`, `product.badge`).
- fechas de promociones en create con refine `startsAt < endsAt`.
- arrays estructurados en about/blog/business hours.

Riesgos:

- `promotionUpdateSchema` es `partial()` y no conserva el refine de rango de fechas del create.
- URLs de imagen son strings con limites de longitud (`max(1000)`) y, en galeria, campo obligatorio (`min(1)`), pero no se validan con `z.string().url()`.
- JSONB como `modules`, `branding`, `hours`, `rules`, `money` no se valida contra el schema DB en runtime mas alla del formulario.

### Uso de `ctx.businessId`

Buen patron general:

- Mutations tenant usan `ctx.businessId` en inserts.
- Updates/deletes de entidades con `business_id` filtran `.eq('business_id', ctx.businessId)`.
- Paginas admin suelen filtrar por `ctx.businessId` al listar y editar entidades raiz.

Riesgos de relaciones padre-hijo:

- `createCategory(ctx, catalogId, input)` inserta `business_id=ctx.businessId` y `catalog_id=catalogId`, pero no verifica que `catalogId` pertenezca a `ctx.businessId`. La FK solo referencia `catalog_pages(id)`, no un par compuesto `(business_id, id)`.
- `createPhoto(ctx, albumId, input)` inserta `business_id=ctx.businessId` y `album_id=albumId`, pero no verifica que `albumId` pertenezca a `ctx.businessId`.
- `createProduct` si verifica que `categoryId` exista con `business_id=ctx.businessId`.
- Algunas paginas/listados anidados validan el padre antes de listar hijos, pero algunas queries de hijos filtran solo por `album_id` o `category_id` despues de validar el padre. Es aceptable si la validacion padre es estricta, pero conviene uniformar con `.eq('business_id', ctx.businessId)` por defensa en profundidad.
- `modules.mutation.ts` y `branding.mutation.ts` reciben `SupabaseServerClient` + `businessId`, no `SuperAdminContext`; dependen de que las Server Actions llamen antes a `getSuperAdminContext`.

### Posibles bugs de datos JSONB NOT NULL

La DB declara `businesses.contact`, `location`, `social`, `hours`, `branding`, `modules` como JSONB `NOT NULL`.

Riesgos:

- `updateBusiness` puede escribir `social: null` cuando no hay redes. `social` es `NOT NULL`, por lo que puede fallar en negocio admin si se dejan redes vacias.
- `createBusiness` y `updateBusinessById` escriben `{}` para `social`, pero `updateBusiness` usa `null`.
- `contact` y `location` se escriben como objetos vacios, consistente con `NOT NULL`.
- `promotions.rules` es nullable, por lo que `buildRules()` devolviendo `null` no rompe schema.

## 9. Supabase schema y RLS

### Tablas principales

- `businesses`
- `catalog_pages`
- `catalog_categories`
- `catalog_products`
- `promotions`
- `about`
- `faq`
- `gallery_albums`
- `gallery_photos`
- `blog`
- `platform_admins`
- `business_admins`

### RLS actual

Todas las tablas principales tienen RLS habilitado.

Lectura publica:

- `businesses_select_public`: `USING (true)`.
- contenido publico (`catalog_*`, `promotions`, `about`, `faq`, `gallery_*`, `blog`): `USING (true)`.

Escritura:

- migracion `002` inicia con policies amplias para authenticated.
- migracion `004` reemplaza INSERT/UPDATE/DELETE por `is_business_admin(business_id)` para contenido.
- `businesses_update_admin` usa `is_business_admin(id)`.
- `businesses_delete_superadmin` queda limitado a `platform_admins`.
- `businesses_insert_superadmin` limitado a `platform_admins`.

### Funcion `is_business_admin`

`is_business_admin(bid UUID)` es `SECURITY DEFINER`, `STABLE`, con `search_path=public`, y retorna true si:

- el usuario esta en `business_admins` para ese `business_id`, o
- el usuario esta en `platform_admins`.

Esto alinea RLS con `getAdminContext`.

### Riesgos de exposicion publica

Riesgo principal: policies de lectura con `USING (true)` no filtran:

- `businesses.is_active`.
- `catalog_pages.is_active`.
- `catalog_categories.is_active`.
- `catalog_products.is_available`.
- `faq.is_active`.
- `gallery_albums.is_active`.
- `gallery_photos.is_active`.
- `blog.is_published`.
- `promotions.status`, `starts_at`, `ends_at`.

Hoy la UI publica depende de services para filtrar. Esto puede ser suficiente para SSR controlado, pero no para acceso directo desde anon key a Supabase si el cliente conoce la tabla.

## 10. Storage e imagenes

Estado actual:

- `supabase/config.toml` tiene `[storage] enabled = true`.
- No se detectan migraciones de bucket.
- No se detectan policies de `storage.objects`.
- No hay helper de upload tipo `uploadBusinessImage`.
- No hay formularios con subida real de archivos.
- Los formularios usan inputs de URL manual (`imageUrl`) para catalogos, productos, promociones, about team image y fotos de galeria.
- `next.config.ts` permite imagenes remotas desde `*.supabase.co/storage/v1/object/public/**` y `picsum.photos`.

Falta para Supabase Storage:

- definir bucket publico/privado.
- definir path convention por negocio, por ejemplo `businesses/{businessId}/catalog/`, `businesses/{businessId}/products/`, `businesses/{businessId}/gallery/` y `businesses/{businessId}/blog/`.
- policies de lectura/escritura.
- helper server/client de upload.
- UI de upload y manejo de reemplazo/eliminacion de imagenes.

## 11. Documentacion

### Actualizada o util

- `README.md` refleja que el codigo vive bajo `src/`.
- `docs/data-flow.md` aclara que cuando habla de `app/`, `services/`, `lib/`, `components/` o `types/`, se refiere a `src/app/`, `src/services/`, `src/lib/`, `src/components/` y `src/types/`.
- `docs/roadmap-consolidacion-business-starter-next.md` describe fases futuras y riesgos que coinciden con varios hallazgos actuales.

### Desactualizada o inconsistente

- `docs/technical-overview.md` dice `Next.js 15`, pero `package.json` usa `next 16.2.4`.
- `docs/technical-overview.md` menciona tabla `blog_posts`; el schema real y servicios usan `blog`.
- `docs/technical-overview.md` lista funciones `createBlogPost`, `updateBlogPost`, `deleteBlogPost`; el codigo real exporta `createPost`, `updatePost`, `deletePost`.
- `docs/technical-overview.md` dice que superadmin gestiona administradores; a nivel UI/actions no existe gestion de `business_admins`.
- `docs/technical-overview.md` habla de Supabase Storage como parte de imagenes, pero Storage aun no esta implementado en schema/helpers/UI.
- `docs/saas-product-vision.md` esta mas orientado a producto futuro con subdominios; el estado actual es path-based.
- Hay textos con mojibake en varios archivos, probablemente por encoding de comentarios/documentacion. No rompe build, pero afecta mantenibilidad.

## 12. Riesgos detectados

1. Negocios inactivos pueden seguir resolviendo en rutas publicas porque `resolveBusinessBySlug` no filtra `is_active` y el tenant layout no lo valida.
2. RLS de lectura publica usa `USING (true)` en tablas de contenido; el filtrado de activos/publicados depende de la app, no de la base.
3. `getProducts` y `getProductBySlug` pueden devolver productos no disponibles; hay riesgo de exposicion si se usan en publico sin filtro.
4. Mutations anidadas `createCategory` y `createPhoto` no validan que `catalogId`/`albumId` pertenezcan al negocio actual antes de insertar.
5. `updateBusiness` puede escribir `social: null` contra una columna `JSONB NOT NULL`.
6. No existe UI/action para gestionar admins de negocio aunque el schema lo soporta.
7. Storage esta planificado pero no implementado; las imagenes dependen de URLs manuales.
8. Documentacion tecnica tiene referencias desactualizadas (`Next.js 15`, `blog_posts`, nombres antiguos de mutations, Storage ya asumido).
9. Validacion de imagenes como strings no asegura URL valida ni pertenencia a storage aprobado.
10. JSONB criticos (`modules`, `branding`, `money`, `rules`, `hours`) no tienen constraints o validacion runtime fuerte contra shape esperado.

## 13. Recomendaciones para las siguientes fases

1. Definir la politica de publicacion de negocios inactivos y aplicar `notFound()` en el layout publico o tenant layout segun el alcance deseado.
2. Endurecer lectura publica en Supabase con policies que reflejen estados publicables, o separar claramente anon/public API de lectura admin.
3. Corregir services publicos para que sus contratos sean seguros por defecto: productos disponibles, negocios activos, promociones publicables.
4. Añadir validaciones padre-hijo en mutations anidadas antes de insert/update, especialmente catalogo-categoria y album-foto.
5. Corregir `updateBusiness` para mantener JSONB `NOT NULL` con `{}`/`[]` en lugar de `null` donde corresponda.
6. Implementar gestion minima de `business_admins` en superadmin o documentar formalmente el proceso manual temporal.
7. Diseñar e implementar Supabase Storage: bucket, paths por negocio, policies y helpers de upload.
8. Actualizar documentacion tecnica despues de resolver los puntos anteriores, especialmente version de Next.js, tabla `blog`, nombres reales de mutations y estado real de Storage.
9. Agregar checks de integridad para JSONB importantes, al menos en capa Zod/mutations y, si aplica, constraints en DB.
10. Mantener el patron de lectura admin directa via `ctx.supabase` y lectura publica via services, pero documentar contratos exactos de cada service.
