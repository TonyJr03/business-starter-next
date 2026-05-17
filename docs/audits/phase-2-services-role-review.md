# Revision Fase 2.1B: rol arquitectonico de `src/services`

Fecha: 2026-05-17

Alcance:
- Imports y usos de `src/services` en `src/` y `docs/`.
- Services exportados desde `src/services/index.ts`.
- Capas admin, superadmin, mutations y documentacion existente.

Restricciones aplicadas: no se modifico logica de negocio, services, paginas, admin, superadmin, mutations, Supabase, RLS, migraciones, `package.json` ni roadmap.

## Conclusion principal

Decision recomendada: **Opcion A, con una excepcion explicita para `business.service.ts`**.

Evidencia:
- La documentacion existente define `src/services/` como **capa de lectura publica**.
- Las paginas publicas y componentes publicos consumen los services de contenido: catalogo, promociones, blog, FAQ, galeria y about.
- El admin de negocio no usa los services de contenido; lee con `ctx.supabase` desde paginas admin y mutations.
- Las Server Actions y mutations admin no importan `src/services`.
- La unica familia usada fuera de publico es `business.service.ts`: `resolveBusinessBySlug`, `getAllBusinesses` y `getBusinessById`. Esto funciona como capa neutral de identidad/plataforma, no como lectura publica de contenido editorial.

Por tanto, no conviene duplicar todo como `getPublicProducts`, `getPublicActivePromotions`, `getPublicPosts`, etc. Para los modulos de contenido, conviene **corregir el contrato de las funciones existentes** para que sean publicas estrictas. La excepcion es business: hay que mantener o formalizar lecturas neutrales para admin/superadmin.

## Resultado de busquedas

Comandos usados:
- `rg -n '@/services|@/services/|services/' src docs -g '*.ts' -g '*.tsx' -g '*.md'`
- `rg -n "resolveBusinessBySlug|getAllBusinesses|getBusinessById|listActiveBusinesses|getCatalogs|getCatalogBySlug|getCategories|getCategoriesByCatalog|getProducts|getProductBySlug|getFeaturedProducts|getProductsByCategory|getPromotions|getPromotionById|getActivePromotions|getPromotionStatus|isPromotionActive|getPosts|getPostBySlug|getAboutContent|getFaqItems|getGalleryAlbums|getGalleryPhotos|getPhotosByAlbum" src docs -g "*.ts" -g "*.tsx" -g "*.md"`

No se encontraron imports relativos hacia services fuera del patron `@/services` / `@/services/...`.

## Usos por zona

### Rutas publicas: `src/app/negocios/[slug]/(public)`

Usan services ampliamente:
- `(public)/layout.tsx`: `resolveBusinessBySlug`, `getCatalogs`.
- `(public)/page.tsx`: `resolveBusinessBySlug`, `getAboutContent`, `getActivePromotions`.
- `(public)/about/page.tsx`: `resolveBusinessBySlug`, `getAboutContent`.
- `(public)/blog/page.tsx`: `resolveBusinessBySlug`, `getPosts`.
- `(public)/blog/[post]/page.tsx`: `resolveBusinessBySlug`, `getPostBySlug`.
- `(public)/catalog/page.tsx`: `resolveBusinessBySlug`, `getCatalogs`.
- `(public)/catalog/[catalogSlug]/page.tsx`: `resolveBusinessBySlug`, `getCatalogBySlug`, `getCategoriesByCatalog`, `getProducts`.
- `(public)/contact/page.tsx`: `resolveBusinessBySlug`.
- `(public)/faq/page.tsx`: `resolveBusinessBySlug`, `getFaqItems`.
- `(public)/gallery/page.tsx`: `resolveBusinessBySlug`, `getGalleryAlbums`, `getGalleryPhotos`, `getPhotosByAlbum`.
- `(public)/promotions/page.tsx`: `resolveBusinessBySlug`, `getPromotions`, `getPromotionStatus`.

Lectura: esta zona confirma que services son la capa de datos publica.

### Layout raiz del tenant: `src/app/negocios/[slug]/layout.tsx`

Usa:
- `resolveBusinessBySlug`.

Rol:
- Layout compartido por subtree publico/admin del tenant.
- Aplica branding y metadata base.
- No es lectura de contenido publico; es resolucion neutral del tenant por slug.

### Rutas admin: `src/app/negocios/[slug]/admin`

Imports directos de services encontrados:
- `admin/(auth)/login/page.tsx`: `resolveBusinessBySlug`.
- `admin/(panel)/layout.tsx`: `resolveBusinessBySlug`.
- `admin/(panel)/page.tsx`: `resolveBusinessBySlug`.

Patron dominante:
- Las paginas admin de contenido consultan con `ctx.supabase` directo:
  - `catalog_pages`
  - `catalog_categories`
  - `catalog_products`
  - `promotions`
  - `blog`
  - `faq`
  - `gallery_albums`
  - `gallery_photos`
  - `about`
  - `businesses`

Lectura:
- Admin no depende de services de contenido.
- Admin usa `resolveBusinessBySlug` solo para resolver identidad/branding/nombre del negocio.

### Rutas superadmin: `src/app/superadmin`

Imports de services encontrados:
- `src/app/superadmin/(panel)/page.tsx`: `getAllBusinesses` desde `@/services/business.service`.
- `src/app/superadmin/(panel)/businesses/page.tsx`: `getAllBusinesses` desde `@/services/business.service`.
- `src/app/superadmin/(panel)/businesses/[id]/page.tsx`: `getBusinessById`.
- `src/app/superadmin/(panel)/businesses/[id]/branding/page.tsx`: `getBusinessById`.
- `src/app/superadmin/(panel)/businesses/[id]/modules/page.tsx`: `getBusinessById`.

Patron:
- Superadmin usa business service para leer negocios activos e inactivos.
- Superadmin actions usan mutations (`createBusiness`, `updateBusinessById`, `deleteBusiness`, `updateBranding`, `updateModules`) con `ctx.supabase`.

Lectura:
- `business.service.ts` funciona como capa de lectura neutral/plataforma.
- Los services de contenido no se usan en superadmin.

### Components publicos

Imports encontrados:
- `src/components/sections/PromotionsSection.tsx`: `getPromotionStatus`.

Rol:
- Componente server de seccion publica.
- Recibe promociones por props y solo calcula estado visual.

### Components admin

No se encontraron imports de `@/services` en componentes admin.

### `src/lib/admin`

Imports encontrados:
- `src/lib/admin/context.ts`: `resolveBusinessBySlug`.

Patron:
- `getAdminContext(slug)` usa `resolveBusinessBySlug` para obtener `business.id`.
- Luego valida membresia con `business_admins` o `platform_admins`.
- Mutations usan `ctx.supabase` y `ctx.businessId`; no usan services.

### Mutations

No se encontraron imports de `src/services` en `src/lib/admin/mutations`.

Patron:
- Todas las mutations operan con `ctx.supabase` o `supabase` recibido desde contexto superadmin.
- Todas las queries de negocio usan `ctx.businessId` o `businessId` explicito.

### Docs

La documentacion confirma la intencion publica:
- `docs/technical-overview.md`: seccion "Capa de servicios (lectura publica)".
- `docs/data-flow.md`: seccion "Capa de servicios - Lectura publica".
- `docs/data-flow.md`: seccion "Por que el admin no usa services".
- `docs/audits/phase-0-inventory.md`: dice que lectura publica usa services y lectura admin evita services.
- `docs/audits/phase-2-public-services-audit.md`: detecta que algunos services son mas amplios que su contrato publico.

Matiz documentado:
- `docs/technical-overview.md` permite que `lib/admin/` importe `services/` "solo business".
- El arbol de dependencias muestra `lib/admin/context.ts -> services/ (resolveBusinessBySlug)`.

## Tabla por funcion exportada

| Funcion | Archivo | Proposito aparente | Usos encontrados | Zonas | Admin | Superadmin | Solo publico | Contrato actual | Contrato recomendado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `resolveBusinessBySlug` | `business.service.ts` | Resolver tenant por slug | Public layout/pages, tenant root layout, admin context/login/panel | Publico, tenant root, admin, lib/admin | Si | No directo | No | Neutral: devuelve activo o inactivo | Mantener neutral o mover a resolver neutral; publico debe verificar `isActive` en guard central |
| `getAllBusinesses` | `business.service.ts` | Listar negocios completos | Superadmin dashboard/list | Superadmin | No | Si | No | Neutral/plataforma: todos los negocios | Mantener neutral para superadmin; no usar en publico |
| `getBusinessById` | `business.service.ts` | Resolver negocio por id desde lista completa | Superadmin detail/branding/modules | Superadmin | No | Si | No | Neutral/plataforma: activo o inactivo | Mantener neutral para superadmin |
| `listActiveBusinesses` | `business.service.ts` | Directorio publico de negocios | `/` plataforma | Publico plataforma | No | No | Si | Publico: filtra `isActive` en memoria | Publico estricto; ideal mover filtro a DB |
| `getCatalogs` | `catalog.service.ts` | Catalogos visibles | Public layout, catalog index | Publico tenant | No | No | Si | Publico parcial: `is_active=true` | Mantener nombre y contrato publico |
| `getCatalogBySlug` | `catalog.service.ts` | Catalogo visible por slug | Catalog detail metadata/page | Publico tenant | No | No | Si | Publico: deriva de catalogos activos | Mantener nombre y contrato publico |
| `getCategories` | `catalog.service.ts` | Categorias visibles | Uso interno en `getCategoriesByCatalog` | Interno service | No | No | No externo | Publico: `is_active=true` | Mantener como helper publico/exportado si se necesita |
| `getCategoriesByCatalog` | `catalog.service.ts` | Categorias visibles de catalogo | Catalog detail | Publico tenant | No | No | Si | Publico: categorias activas, filtro catalogo en memoria | Mantener nombre; asegurar catalogo publico por caller o query |
| `getProducts` | `catalog.service.ts` | Productos de negocio | Catalog detail, helpers internos | Publico tenant e interno | No | No | Si externo | Hibrido accidental: no filtra `is_available` | Reformar nombre actual para publico estricto o dejar de usarlo en publico y crear helper especifico |
| `getProductBySlug` | `catalog.service.ts` | Producto por slug | Sin uso externo encontrado | Sin uso externo | No | No | No | Hibrido accidental: no filtra `is_available` | Si se conserva en services, debe ser publico estricto |
| `getFeaturedProducts` | `catalog.service.ts` | Productos destacados disponibles | Sin uso externo encontrado | Sin uso externo | No | No | No | Publico: filtra `isFeatured` e `isAvailable` en memoria | Mantener o usar en paginas; mover filtros a DB si se optimiza |
| `getProductsByCategory` | `catalog.service.ts` | Productos disponibles por categoria | Sin uso externo encontrado | Sin uso externo | No | No | No | Publico: filtra categoria e `isAvailable` en memoria | Mantener como lectura publica especifica |
| `getPromotions` | `promotions.service.ts` | Promociones del negocio | Public promotions page, helpers internos | Publico tenant e interno | No | No | Si externo | Hibrido accidental: devuelve todas | Reformar o dejar de exponer en publico; contrato recomendado publico visible |
| `getPromotionById` | `promotions.service.ts` | Promocion por id | Sin uso externo encontrado | Sin uso externo | No | No | No | Hibrido accidental: deriva de todas | Si se conserva, definir si es publico; si publico, debe filtrar visibilidad |
| `getActivePromotions` | `promotions.service.ts` | Promociones activas | Home publica | Publico tenant | No | No | Si | Publico, pero filtro en memoria y helper incompleto | Mantener nombre; mover filtros simples a DB y corregir estado |
| `getPromotionStatus` | `promotions.service.ts` | Estado de dominio/visual | Public promotions page, `PromotionsSection`, helpers | Publico/components | No | No | Si | Helper compartido, respeta solo `paused` explicitamente | Helper neutral de dominio; debe respetar todos los status explicitos o documentar precedencia |
| `isPromotionActive` | `promotions.service.ts` | Boolean helper | Sin uso externo encontrado | Sin uso externo | No | No | No | Helper de dominio | Mantener si acompana a `getPromotionStatus`, o remover en refactor futuro |
| `getPosts` | `blog.service.ts` | Posts visibles | Blog index | Publico tenant | No | No | Si | Publico parcial: `is_published=true`, sin fecha efectiva | Mantener nombre; agregar regla `published_at <= hoy` si aplica |
| `getPostBySlug` | `blog.service.ts` | Post visible por slug | Blog detail metadata/page | Publico tenant | No | No | Si | Publico parcial: `is_published=true`, sin fecha efectiva | Mantener nombre; agregar regla `published_at <= hoy` si aplica |
| `getAboutContent` | `about.service.ts` | About del negocio | Home/about | Publico tenant | No | No | Si | Publico por modulo; tabla sin flag propio | Mantener nombre; gating por modulo/negocio |
| `getFaqItems` | `faq.service.ts` | FAQs visibles | FAQ page | Publico tenant | No | No | Si | Publico: `is_active=true` | Mantener nombre y contrato publico |
| `getGalleryAlbums` | `gallery.service.ts` | Albums visibles | Gallery page | Publico tenant | No | No | Si | Publico: `is_active=true` | Mantener nombre y contrato publico |
| `getGalleryPhotos` | `gallery.service.ts` | Fotos visibles | Gallery page, helper interno | Publico tenant e interno | No | No | Si externo | Publico parcial: foto activa, no valida album activo | Mantener nombre; cruzar con albums activos |
| `getPhotosByAlbum` | `gallery.service.ts` | Fotos visibles de album | Gallery page | Publico tenant | No | No | Si | Publico parcial: deriva de fotos activas, caller valida album activo | Mantener nombre; asegurar album activo por query o caller |

## Respuestas explicitas

### Los services son usados por admin?

Si, pero de forma acotada:
- Admin de negocio usa `resolveBusinessBySlug`.
- `src/lib/admin/context.ts` usa `resolveBusinessBySlug`.
- Superadmin usa `getAllBusinesses` y `getBusinessById`.

No hay uso admin de los services de contenido: catalogo, promociones, blog, FAQ, galeria, about.

### Que funciones de services son usadas fuera del arbol publico?

- `resolveBusinessBySlug`: tenant root layout, admin login, admin panel layout, admin panel home, `getAdminContext`.
- `getAllBusinesses`: superadmin dashboard y listado de negocios.
- `getBusinessById`: superadmin detalle, branding y modulos.

Ademas, `getPromotionStatus` se usa en `src/components/sections/PromotionsSection.tsx`, que es un componente publico/server de seccion.

### `resolveBusinessBySlug` es una excepcion?

Si. Es la excepcion principal. En la practica no es solo "public service"; es un resolver neutral de tenant usado por:
- rutas publicas,
- layout raiz del tenant,
- admin context,
- admin UI,
- metadata.

Por eso no conviene cambiarlo sin plan. Si se quiere una lectura estrictamente publica del negocio, debe hacerse como guard central o funcion separada, sin romper admin/superadmin.

### Hay funciones neutrales?

Si:
- `resolveBusinessBySlug`
- `getAllBusinesses`
- `getBusinessById`
- `getPromotionStatus`
- `isPromotionActive`

Las tres primeras son neutrales/plataforma. Las dos ultimas son helpers de dominio, no lecturas DB.

### Hay funciones publicas estrictas?

Si, por contrato o por uso:
- `listActiveBusinesses`
- `getCatalogs`
- `getCatalogBySlug`
- `getCategories`
- `getCategoriesByCatalog`
- `getFeaturedProducts`
- `getProductsByCategory`
- `getPosts`
- `getPostBySlug`
- `getAboutContent`
- `getFaqItems`
- `getGalleryAlbums`
- `getGalleryPhotos`
- `getPhotosByAlbum`
- `getActivePromotions`

Algunas son publicas incompletas y deben ajustarse:
- `getProducts`
- `getProductBySlug`
- `getPromotions`
- `getPromotionById`
- `getPosts`
- `getPostBySlug`
- `getGalleryPhotos`

### Hay funciones sin uso actual?

Sin uso externo encontrado:
- `getCategories` (usada internamente por `getCategoriesByCatalog`).
- `getProductBySlug`.
- `getFeaturedProducts`.
- `getProductsByCategory`.
- `getPromotionById`.
- `isPromotionActive`.

Nota: "sin uso externo" no implica borrar ahora. Pueden ser parte del API planificado.

### Tiene sentido crear `getPublic...`?

Para contenido, no como regla general.

Motivos:
- La documentacion ya define `src/services` como lectura publica.
- Admin no usa esos services de contenido.
- Duplicar `getPublicProducts` junto a `getProducts` dejaria dos contratos ambiguos dentro de la misma carpeta.
- La siguiente fase necesita endurecer el contrato real, no multiplicar nombres.

Excepcion:
- Business puede necesitar una funcion publicamente estricta si se quiere mover `is_active=true` a DB para rutas publicas. Aun asi, el nombre deberia expresar estado real, por ejemplo `resolveActiveBusinessBySlug`, y conservar `resolveBusinessBySlug` como neutral para admin/context, o mover neutralidad a otra capa en una fase posterior.

## Decision arquitectonica recomendada

### Escoger Opcion A, con excepcion business

Services de contenido como capa publica:
- Mantener nombres actuales.
- Ajustar funciones existentes para devolver solo contenido publicable.
- No crear duplicados `getPublic...` para catalogo, promociones, blog, FAQ, galeria y about.
- Crear funciones admin separadas solo si el admin empieza a necesitar abstracciones reutilizables; hoy no las necesita.

Business como excepcion neutral:
- `business.service.ts` ya es usado por admin/superadmin y no debe convertirse sin mas en publico estricto.
- Documentar que contiene resolvers neutrales de tenant/plataforma y funciones publicas especificas como `listActiveBusinesses`.
- Si se quiere maxima claridad a futuro, considerar separar business en:
  - resolver neutral: `resolveBusinessBySlug`, `getAllBusinesses`, `getBusinessById`;
  - funcion publica: `listActiveBusinesses` y opcionalmente `resolveActiveBusinessBySlug`.

No se recomienda Opcion B:
- Convertiria todos los services en compartidos cuando la evidencia muestra que admin no los comparte.
- Forzaria `getPublic...`/`getAdmin...` innecesarios para contenido.

No se recomienda Opcion C ahora:
- Separar carpetas `src/services/public` y `src/services/admin` seria un refactor de estructura sin necesidad actual.
- El admin ya tiene su capa: `lib/admin/context.ts`, `lib/admin/mutations` y queries directas con `ctx.supabase`.

## Plan actualizado sugerido para Fase 2

### Fase 2.2: formalizar contratos publicos sin duplicar nombres

Tocar primero:
- `catalog.service.ts`
- `promotions.service.ts`
- `blog.service.ts`
- `gallery.service.ts`

Reformar:
- `getProducts`: debe ser publico o dejar de usarse en paginas publicas. Recomendacion: si se conserva en `services`, que devuelva solo productos publicables.
- `getProductBySlug`: si permanece exportado desde `services`, debe filtrar producto publicable.
- `getPromotions`: no debe usarse para render publico si devuelve todas. Recomendacion: reformarlo a publico visible o hacerlo interno.
- `getActivePromotions`: mantener nombre y corregir reglas.
- `getPosts` / `getPostBySlug`: agregar fecha efectiva si `published_at` define publicacion.
- `getGalleryPhotos`: asegurar que no devuelve fotos de albums inactivos.

Nombres a conservar:
- `getCatalogs`
- `getCatalogBySlug`
- `getCategories`
- `getCategoriesByCatalog`
- `getProducts`
- `getProductsByCategory`
- `getFeaturedProducts`
- `getPromotions`
- `getActivePromotions`
- `getPosts`
- `getPostBySlug`
- `getFaqItems`
- `getGalleryAlbums`
- `getGalleryPhotos`
- `getPhotosByAlbum`
- `getAboutContent`

Nombres a tratar con cuidado:
- `resolveBusinessBySlug`: mantener neutral por ahora.
- `getAllBusinesses`: mantener superadmin/neutral.
- `getBusinessById`: mantener superadmin/neutral.

Cambios que no hacer:
- No crear una familia completa `getPublic...`.
- No mover admin a services.
- No cambiar mutations para usar services.
- No crear `src/services/admin` ahora.
- No cambiar RLS/migraciones en esta fase.

### Fase 2.3: actualizar paginas publicas que usan lecturas demasiado amplias

Orden:
1. `src/app/negocios/[slug]/(public)/promotions/page.tsx`
   - Debe renderizar solo promociones publicables.
2. `src/app/negocios/[slug]/(public)/page.tsx`
   - Debe usar el mismo contrato corregido de promociones activas.
3. `src/app/negocios/[slug]/(public)/catalog/[catalogSlug]/page.tsx`
   - Debe dejar de mostrar productos no disponibles.
4. `src/app/negocios/[slug]/(public)/blog/page.tsx` y `blog/[post]/page.tsx`
   - Deben respetar fecha efectiva de publicacion.
5. `src/app/negocios/[slug]/(public)/gallery/page.tsx`
   - Debe excluir fotos de albums inactivos en vista general.

### Fase 2.4: decidir formalizacion de business

Opciones puntuales:
- Mantener `resolveBusinessBySlug` neutral y confiar en `(public)/layout.tsx` + metadata para `isActive`.
- O crear solo una funcion especifica `resolveActiveBusinessBySlug` para rutas publicas, dejando `resolveBusinessBySlug` neutral.

No se recomienda renombrar `resolveBusinessBySlug` ahora porque:
- Admin context lo necesita para negocios inactivos.
- Superadmin/tenant root dependen del resolver neutral.
- El cambio tendria mas blast radius que los services de contenido.

## Veredicto final

`src/services` no es una capa compartida public/admin para contenido. Es una capa concebida como **lectura publica**, con una excepcion historica y parcialmente documentada: `business.service.ts` tambien sirve a admin/superadmin como resolver neutral de negocio.

La reforma correcta para Fase 2 no es duplicar todo con prefijo `public`; es hacer que los services de contenido cumplan su contrato publico actual y documentar/tratar business como excepcion neutral.
