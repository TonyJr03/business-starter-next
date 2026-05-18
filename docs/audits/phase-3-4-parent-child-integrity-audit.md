# Phase 3.4 parent-child integrity audit

Fecha: 2026-05-18

Alcance: auditoria estatica de constraints, foreign keys, indexes, RLS de escritura y mutations/admin actions relacionados con integridad padre-hijo. No se modifica codigo ni migraciones.

## Resumen ejecutivo

El esquema actual evita referencias a filas inexistentes mediante foreign keys simples, pero no impide relaciones cruzadas entre negocios. Las tres relaciones criticas pueden almacenar un `business_id` en la fila hija distinto al `business_id` del padre referenciado:

- `catalog_categories.business_id` puede diferir de `catalog_pages.business_id`.
- `catalog_products.business_id` puede diferir de `catalog_categories.business_id`.
- `gallery_photos.business_id` puede diferir de `gallery_albums.business_id`.

La migracion `005_harden_public_read_policies.sql` ya endurece lectura publica y sus helpers publicos validan el padre del mismo negocio para SELECT publico. Sin embargo, las policies de escritura actuales siguen aceptando cualquier `parent_id` existente mientras el usuario sea admin del `business_id` escrito. Esto deja la integridad dependiendo de mutations/admin pages y de convencion de uso.

Recomendacion: **Opcion A**. Agregar constraints compuestas en base de datos y mantener RLS/mutations como defensa adicional.

## Migraciones revisadas

- `supabase/migrations/001_businesses.sql`
- `supabase/migrations/002_pages_modules.sql`
- `supabase/migrations/003_platform_admins.sql`
- `supabase/migrations/004_business_admins.sql`
- `supabase/migrations/005_harden_public_read_policies.sql`

## Constraints e indexes actuales

PostgreSQL crea indices implicitos para primary keys y unique constraints. No se encontraron `CREATE INDEX` explicitos en las migraciones.

| Tabla | PK | FKs | Unique constraints / indices implicitos | Observacion |
| --- | --- | --- | --- | --- |
| `businesses` | `id` | ninguna | `slug` unico | Tabla raiz. |
| `platform_admins` | `user_id` | `user_id -> auth.users(id) ON DELETE CASCADE` | PK | Interna. |
| `business_admins` | `(user_id, business_id)` | `user_id -> auth.users(id)`, `business_id -> businesses(id)` | PK compuesta | No aplica a contenido padre-hijo. |
| `catalog_pages` | `id` | `business_id -> businesses(id) ON DELETE CASCADE` | `UNIQUE (business_id, slug)` | No tiene `UNIQUE (business_id, id)`. |
| `catalog_categories` | `id` | `business_id -> businesses(id)`, `catalog_id -> catalog_pages(id)` | `UNIQUE (catalog_id, slug)` | No hay constraint que asegure `catalog_id` del mismo negocio. |
| `catalog_products` | `id` | `business_id -> businesses(id)`, `category_id -> catalog_categories(id)` | `UNIQUE (category_id, slug)` | No hay constraint que asegure `category_id` del mismo negocio. |
| `gallery_albums` | `id` | `business_id -> businesses(id) ON DELETE CASCADE` | `UNIQUE (business_id, slug)` | No tiene `UNIQUE (business_id, id)`. |
| `gallery_photos` | `id` | `business_id -> businesses(id)`, `album_id -> gallery_albums(id)` | ninguna adicional | No hay constraint que asegure `album_id` del mismo negocio. |

## Posibilidad de FKs compuestas

Si se quiere declarar:

- `catalog_categories(business_id, catalog_id) -> catalog_pages(business_id, id)`
- `catalog_products(business_id, category_id) -> catalog_categories(business_id, id)`
- `gallery_photos(business_id, album_id) -> gallery_albums(business_id, id)`

entonces las columnas referenciadas necesitan una key unica o primary key compatible. Actualmente no existen keys unicas sobre:

- `catalog_pages(business_id, id)`
- `catalog_categories(business_id, id)`
- `gallery_albums(business_id, id)`

Aunque `id` ya es primary key global, PostgreSQL requiere una constraint o indice unico que cubra exactamente el conjunto referenciado para una FK compuesta. Por tanto, antes de agregar las FKs compuestas habria que agregar constraints unicas o indices unicos en esas combinaciones.

Constraints sugeridas:

```sql
ALTER TABLE catalog_pages
  ADD CONSTRAINT catalog_pages_business_id_id_key UNIQUE (business_id, id);

ALTER TABLE catalog_categories
  ADD CONSTRAINT catalog_categories_business_id_id_key UNIQUE (business_id, id);

ALTER TABLE gallery_albums
  ADD CONSTRAINT gallery_albums_business_id_id_key UNIQUE (business_id, id);
```

FKs compuestas sugeridas:

```sql
ALTER TABLE catalog_categories
  ADD CONSTRAINT catalog_categories_business_catalog_fk
  FOREIGN KEY (business_id, catalog_id)
  REFERENCES catalog_pages (business_id, id)
  ON DELETE CASCADE;

ALTER TABLE catalog_products
  ADD CONSTRAINT catalog_products_business_category_fk
  FOREIGN KEY (business_id, category_id)
  REFERENCES catalog_categories (business_id, id)
  ON DELETE CASCADE;

ALTER TABLE gallery_photos
  ADD CONSTRAINT gallery_photos_business_album_fk
  FOREIGN KEY (business_id, album_id)
  REFERENCES gallery_albums (business_id, id)
  ON DELETE CASCADE;
```

Nota: se pueden agregar sin dropear inicialmente las FKs simples existentes. Serian redundantes pero mas fuertes. Una fase posterior podria decidir si conviene dropear las FKs simples auto-nombradas para reducir ruido.

## Riesgos actuales por relacion

### `catalog_categories.business_id` + `catalog_categories.catalog_id`

Estado DB:

- `business_id` referencia un negocio existente.
- `catalog_id` referencia un catalogo existente.
- No hay garantia DB de que ambos pertenezcan al mismo negocio.

Estado app:

- `createCategory(ctx, catalogId, input)` inserta `business_id = ctx.businessId` y `catalog_id = catalogId`.
- No valida dentro de la mutation que `catalogId` pertenezca a `ctx.businessId`.
- La pagina `catalog/[catalogId]/categories/page.tsx` si verifica antes del listado que el catalogo exista con `.eq('business_id', ctx.businessId)`.
- La action recibe `catalogId` desde ruta; si se invoca directamente con otro `catalogId`, la mutation depende de RLS/FK simple.

Riesgo:

- Un business admin podria intentar insertar una categoria con `business_id` propio y `catalog_id` de otro negocio si conoce el UUID. RLS actual permite el `business_id` propio; la FK simple permite cualquier catalogo existente.

### `catalog_products.business_id` + `catalog_products.category_id`

Estado DB:

- `business_id` referencia un negocio existente.
- `category_id` referencia una categoria existente.
- No hay garantia DB de que ambos pertenezcan al mismo negocio.

Estado app:

- `createProduct(ctx, input)` valida antes de insertar:
  - `catalog_categories.id = input.categoryId`
  - `catalog_categories.business_id = ctx.businessId`
- `updateProduct(ctx, id, input)` valida lo mismo si `input.categoryId` cambia.
- Las actions derivan `categoryId` de la ruta y lo pasan al schema.

Riesgo:

- Bajo en los flujos actuales, porque la mutation valida la categoria del negocio.
- Aun asi, DB/RLS no lo impiden por si solas. Un cliente directo que llegue a la tabla y cumpla `is_business_admin(business_id)` podria depender de que pase por mutations; las constraints compuestas cerrarian el hueco.

### `gallery_photos.business_id` + `gallery_photos.album_id`

Estado DB:

- `business_id` referencia un negocio existente.
- `album_id` referencia un album existente.
- No hay garantia DB de que ambos pertenezcan al mismo negocio.

Estado app:

- `createPhoto(ctx, albumId, input)` inserta `business_id = ctx.businessId` y `album_id = albumId`.
- No valida dentro de la mutation que `albumId` pertenezca a `ctx.businessId`.
- La pagina `gallery/[albumId]/photos/page.tsx` si verifica antes del listado que el album exista con `.eq('business_id', ctx.businessId)`.
- La action recibe `albumId` desde ruta; si se invoca directamente con otro `albumId`, la mutation depende de RLS/FK simple.

Riesgo:

- Similar a categorias: un business admin podria intentar crear foto con `business_id` propio y `album_id` de otro negocio si conoce el UUID. RLS actual permite el `business_id` propio; la FK simple permite cualquier album existente.

## Mutations y actions revisadas

| Archivo | Operacion | `businessId` seguro | Padre viene de | Valida padre del mismo negocio antes de escribir | Riesgo actual |
| --- | --- | --- | --- | --- | --- |
| `src/lib/admin/mutations/catalog.mutation.ts` | `createCatalogPage` | Si, `ctx.businessId` | No aplica | No aplica | Bajo. |
| `src/lib/admin/mutations/catalog.mutation.ts` | `updateCatalogPage` | Si, `.eq('business_id', ctx.businessId)` | No aplica | No aplica | Bajo. |
| `src/lib/admin/mutations/catalog.mutation.ts` | `deleteCatalogPage` | Si, `.eq('business_id', ctx.businessId)` | No aplica | No aplica | Bajo. |
| `src/lib/admin/mutations/catalog.mutation.ts` | `createCategory` | Si, `ctx.businessId` | `catalogId` parametro de ruta/action | No | Alto para API/action directa. |
| `src/lib/admin/mutations/catalog.mutation.ts` | `updateCategory` | Si, `.eq('business_id', ctx.businessId)` | No cambia `catalog_id` | No aplica para update actual | Bajo-medio; la fila podria estar inconsistente previamente. |
| `src/lib/admin/mutations/catalog.mutation.ts` | `deleteCategory` | Si, `.eq('business_id', ctx.businessId)` | No aplica | No aplica | Bajo. |
| `src/lib/admin/mutations/catalog.mutation.ts` | `createProduct` | Si, `ctx.businessId` | `input.categoryId` | Si, consulta categoria por id + business | Bajo. |
| `src/lib/admin/mutations/catalog.mutation.ts` | `updateProduct` | Si, `.eq('business_id', ctx.businessId)` | `input.categoryId` si cambia | Si, consulta categoria por id + business | Bajo. |
| `src/lib/admin/mutations/catalog.mutation.ts` | `deleteProduct` | Si, `.eq('business_id', ctx.businessId)` | No aplica | No aplica | Bajo. |
| `src/lib/admin/mutations/gallery.mutation.ts` | `createAlbum` | Si, `ctx.businessId` | No aplica | No aplica | Bajo. |
| `src/lib/admin/mutations/gallery.mutation.ts` | `updateAlbum` | Si, `.eq('business_id', ctx.businessId)` | No aplica | No aplica | Bajo. |
| `src/lib/admin/mutations/gallery.mutation.ts` | `deleteAlbum` | Si, `.eq('business_id', ctx.businessId)` | No aplica | No aplica | Bajo. |
| `src/lib/admin/mutations/gallery.mutation.ts` | `createPhoto` | Si, `ctx.businessId` | `albumId` parametro de ruta/action | No | Alto para API/action directa. |
| `src/lib/admin/mutations/gallery.mutation.ts` | `updatePhoto` | Si, `.eq('business_id', ctx.businessId)` | No cambia `album_id` | No aplica para update actual | Bajo-medio; la fila podria estar inconsistente previamente. |
| `src/lib/admin/mutations/gallery.mutation.ts` | `deletePhoto` | Si, `.eq('business_id', ctx.businessId)` | No aplica | No aplica | Bajo. |
| `src/app/.../catalog/[catalogId]/categories/actions.ts` | create/update/delete category actions | Si, via `getAdminContext(slug)` | `catalogId` de ruta | No dentro de action; delega a mutation | Medio. |
| `src/app/.../catalog/[catalogId]/categories/[categoryId]/products/actions.ts` | create/update/delete product actions | Si, via `getAdminContext(slug)` | `categoryId` de ruta | Si en mutation para create/update | Bajo. |
| `src/app/.../gallery/[albumId]/photos/actions.ts` | create/update/delete photo actions | Si, via `getAdminContext(slug)` | `albumId` de ruta | No dentro de action; delega a mutation | Medio. |

Paginas admin relevantes revisadas:

- `catalog/[catalogId]/categories/page.tsx`: verifica catalogo por `id` y `business_id` antes de listar categorias.
- `catalog/[catalogId]/categories/[categoryId]/page.tsx`: filtra categoria por `id` y `catalog_id`, pero no por `business_id`; RLS limita a negocios autorizados.
- `catalog/[catalogId]/categories/[categoryId]/products/page.tsx`: filtra categoria por `id` y `catalog_id`, pero no filtra explicitamente `catalog_pages.business_id = ctx.businessId`; RLS limita filas visibles.
- `catalog/[catalogId]/categories/[categoryId]/products/[productId]/page.tsx`: filtra producto por `id` y `category_id`, pero no por `business_id`; RLS limita filas visibles.
- `gallery/[albumId]/photos/page.tsx`: verifica album por `id` y `business_id` antes de listar fotos.
- `gallery/[albumId]/photos/[photoId]/page.tsx`: filtra foto por `id` y `album_id`, pero no por `business_id`; RLS limita filas visibles.

## Policies de escritura actuales

La migracion `004_business_admins.sql` endurecio escrituras reemplazando `USING(true)`/`WITH CHECK(true)` por `is_business_admin(...)`.

Policies relevantes:

- `catalog_pages_insert_admin`: `WITH CHECK (is_business_admin(business_id))`.
- `catalog_pages_update_admin`: `USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
- `catalog_pages_delete_admin`: `USING (is_business_admin(business_id))`.
- `catalog_categories_insert_admin`: `WITH CHECK (is_business_admin(business_id))`.
- `catalog_categories_update_admin`: `USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
- `catalog_categories_delete_admin`: `USING (is_business_admin(business_id))`.
- `catalog_products_insert_admin`: `WITH CHECK (is_business_admin(business_id))`.
- `catalog_products_update_admin`: `USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
- `catalog_products_delete_admin`: `USING (is_business_admin(business_id))`.
- `gallery_albums_insert_admin`: `WITH CHECK (is_business_admin(business_id))`.
- `gallery_albums_update_admin`: `USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
- `gallery_albums_delete_admin`: `USING (is_business_admin(business_id))`.
- `gallery_photos_insert_admin`: `WITH CHECK (is_business_admin(business_id))`.
- `gallery_photos_update_admin`: `USING (is_business_admin(business_id)) WITH CHECK (is_business_admin(business_id))`.
- `gallery_photos_delete_admin`: `USING (is_business_admin(business_id))`.

Conclusion: las policies de escritura actuales validan pertenencia del usuario al `business_id` de la fila escrita, pero no validan que `catalog_id`, `category_id` o `album_id` pertenezcan a ese mismo `business_id`.

## Estrategias de hardening

### Opcion A: constraints compuestas en DB + RLS/mutations como defensa adicional

Ventajas:

- Es la fuente de verdad mas fuerte.
- Protege cualquier camino de escritura: admin UI, client directo, scripts, Edge Functions y futuras mutations.
- Hace imposible persistir relaciones cruzadas.
- Reduce dependencia de disciplina en cada mutation.

Costos/riesgos:

- Requiere validar datos existentes antes de agregar constraints.
- Requiere agregar unique constraints redundantes sobre `(business_id, id)` en padres.
- Puede fallar la migracion si ya existen filas inconsistentes.

Recomendacion: usar esta opcion.

### Opcion B: solo endurecer `WITH CHECK`

Ventajas:

- Menos invasiva.
- Puede bloquear escrituras inconsistentes desde roles sujetos a RLS.

Limitaciones:

- Menos fuerte que constraints.
- No cubre escrituras con `service_role` o owners que bypass RLS.
- Las condiciones con subqueries/helpers deben cuidarse para evitar recursion y complejidad.

Uso recomendado: como capa adicional, no como unica solucion.

### Opcion C: solo validar en mutations

Ventajas:

- Mas facil de implementar a corto plazo.
- Mejora mensajes de error UX.

Limitaciones:

- Fragil ante APIs directas o futuros flujos.
- Ya hay casos sin validacion dentro de mutation (`createCategory`, `createPhoto`).

Uso recomendado: temporal o complementario para errores amigables, no como garantia de integridad.

## Recomendacion final para 3.4B/3.4C

Camino recomendado: **Opcion A**, separando migracion DB y ajustes de app si se quiere reducir riesgo.

### 3.4B sugerida: migracion DB de constraints

1. Ejecutar queries de prevalidacion:

```sql
SELECT cc.*
FROM catalog_categories cc
JOIN catalog_pages cp ON cp.id = cc.catalog_id
WHERE cc.business_id <> cp.business_id;

SELECT cp.*
FROM catalog_products cp
JOIN catalog_categories cc ON cc.id = cp.category_id
WHERE cp.business_id <> cc.business_id;

SELECT gp.*
FROM gallery_photos gp
JOIN gallery_albums ga ON ga.id = gp.album_id
WHERE gp.business_id <> ga.business_id;
```

2. Si las queries devuelven filas, decidir correccion manual antes de constraints.
3. Agregar unique constraints de padres:
   - `catalog_pages_business_id_id_key UNIQUE (business_id, id)`
   - `catalog_categories_business_id_id_key UNIQUE (business_id, id)`
   - `gallery_albums_business_id_id_key UNIQUE (business_id, id)`
4. Agregar FKs compuestas:
   - `catalog_categories(business_id, catalog_id) -> catalog_pages(business_id, id)`
   - `catalog_products(business_id, category_id) -> catalog_categories(business_id, id)`
   - `gallery_photos(business_id, album_id) -> gallery_albums(business_id, id)`
5. Mantener inicialmente las FKs simples.

Separacion sugerida:

- Si se quiere maxima seguridad operativa, hacer dos migraciones: una para catalogo y otra para galeria.
- Si la base esta limpia y pequena, una sola migracion `006_parent_child_integrity_constraints.sql` es razonable.

### 3.4C sugerida: ajustes de mutations/RLS

Mutations a revisar o ajustar:

- `createCategory`: antes de insertar, validar `catalog_pages.id = catalogId AND business_id = ctx.businessId`.
- `createPhoto`: antes de insertar, validar `gallery_albums.id = albumId AND business_id = ctx.businessId`.
- Opcional: agregar filtros `.eq('business_id', ctx.businessId)` en paginas edit/list donde hoy se confia en RLS.

RLS `WITH CHECK` opcional posterior:

- `catalog_categories_insert/update`: validar padre del mismo negocio con helper o subquery.
- `catalog_products_insert/update`: validar categoria del mismo negocio.
- `gallery_photos_insert/update`: validar album del mismo negocio.

Tests manuales sugeridos:

- Intentar crear categoria en catalogo del mismo negocio: debe pasar.
- Intentar crear categoria con `business_id` propio y `catalog_id` de otro negocio: debe fallar por FK compuesta.
- Intentar crear producto en categoria del mismo negocio: debe pasar.
- Intentar crear producto con categoria de otro negocio: debe fallar por FK compuesta.
- Intentar crear foto en album del mismo negocio: debe pasar.
- Intentar crear foto con album de otro negocio: debe fallar por FK compuesta.
- Confirmar CRUD normal de catalogos/categorias/productos/albumes/fotos desde admin.
- Confirmar que delete cascade sigue funcionando como esperado.

## Validacion de este documento

- `npm.cmd run lint`: OK.
  - Salida relevante: `eslint`.
- `npm.cmd run build`: OK.
  - Salida relevante: `Next.js 16.2.4 (Turbopack)`, compiled successfully, TypeScript OK, static pages generated OK.
- `git status --short`:
  - `?? docs/audits/phase-3-4-parent-child-integrity-audit.md`
- `git diff --stat`:
  - Sin salida. El archivo es nuevo y no trackeado, por eso no aparece en `git diff --stat`.
- `git diff`:
  - Sin salida. El archivo es nuevo y no trackeado, por eso no aparece en `git diff`.
