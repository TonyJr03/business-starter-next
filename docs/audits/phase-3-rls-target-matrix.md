# Phase 3.2 RLS target matrix

Fecha: 2026-05-17

Alcance: diseno definitivo de policies RLS objetivo para la futura migracion de Fase 3.3. No se crea migracion en esta fase.

## Base revisada

- `docs/audits/phase-3-rls-audit.md`
- `supabase/migrations/001_businesses.sql`
- `supabase/migrations/002_pages_modules.sql`
- `supabase/migrations/003_platform_admins.sql`
- `supabase/migrations/004_business_admins.sql`
- `src/services/business.service.ts`
- `src/services/catalog.service.ts`
- `src/services/promotions.service.ts`
- `src/services/blog.service.ts`
- `src/services/gallery.service.ts`
- `src/services/about.service.ts`
- `src/services/faq.service.ts`
- `src/lib/admin/context.ts`
- `src/lib/admin/mutations/*`
- `src/app/superadmin`
- `src/config/platform-defaults.ts`
- `src/lib/modules/resolver.ts`

## Roles logicos

| Rol | Definicion |
| --- | --- |
| `anon` | Visitante sin sesion, publishable key de Supabase y rol Postgres `anon`. |
| `authenticated_sin_rol` | Usuario autenticado que no tiene fila valida en `business_admins` ni en `platform_admins`. |
| `business_admin` | Usuario autenticado con fila en `business_admins` para un `business_id`, o equivalente por `is_business_admin(business_id)`. |
| `platform_admin` | Usuario autenticado con fila en `platform_admins`; hoy `is_business_admin(business_id)` tambien lo considera admin de cualquier negocio. |

## Decision sobre modulos en RLS

Recomendacion para Fase 3.3: **Opcion A**.

La RLS publica debe proteger estados de publicacion de datos, pero no debe revisar `businesses.modules` todavia. Las rutas publicas seguiran dando 404 cuando un modulo este desactivado; RLS impedira leer contenido no publico aunque se consulte la API directamente.

### Opcion A: RLS no revisa `businesses.modules`

Ventajas:

- Es simple y menos fragil.
- Se alinea con el objetivo inmediato: reemplazar `USING (true)` por reglas de publicacion de contenido.
- Evita duplicar en SQL el resolver de modulos que hoy vive en TypeScript.
- Evita romper datos cuando `modules` no tenga todas las claves.
- Respeta que `businesses.modules` almacena overrides, no necesariamente la configuracion efectiva completa.

Riesgos:

- Si un modulo esta desactivado en la app, su contenido activo podria seguir siendo legible por API directa.
- La autorizacion de "ruta publica disponible" queda en app, no en RLS.

Justificacion:

Hoy `platformDefaults.modules.pages.*.enabled` vive en codigo y `businesses.modules` guarda deltas por tenant. La configuracion efectiva sale de `resolveModules()`, no de una columna normalizada. Una policy SQL que lea solo JSONB no puede reproducir fielmente ese merge sin congelar defaults de plataforma en SQL.

### Opcion B: RLS tambien revisa `businesses.modules`

Ventajas:

- La API directa queda mas alineada con el comportamiento de rutas publicas.
- Si un modulo se apaga, sus filas activas dejan de ser visibles publicamente.

Riesgos:

- Alta dependencia de la estructura JSONB.
- Puede romper si `modules` no esta normalizado o si faltan claves.
- Duplicaria parte de `src/lib/modules/resolver.ts` en SQL.
- Si los defaults globales cambian en codigo, SQL podria quedar desincronizado.

Rutas JSONB candidatas si se adopta mas adelante:

| Modulo | Ruta JSONB |
| --- | --- |
| `catalog` | `modules #>> '{pages,catalog,enabled}' = 'true'` |
| `promotions` | `modules #>> '{pages,promotions,enabled}' = 'true'` |
| `about` | `modules #>> '{pages,about,enabled}' = 'true'` |
| `faq` | `modules #>> '{pages,faq,enabled}' = 'true'` |
| `gallery` | `modules #>> '{pages,gallery,enabled}' = 'true'` |
| `blog` | `modules #>> '{pages,blog,enabled}' = 'true'` |

Para que Opcion B sea segura, primero convendria persistir configuracion efectiva normalizada o crear helpers SQL conscientes de defaults.

## Advertencia RLS importante

En PostgreSQL RLS, multiples policies permisivas para la misma accion se combinan con `OR`. Por eso, si queda una policy SELECT antigua con `USING (true)`, cualquier policy nueva restrictiva no tendra efecto real. La migracion 3.3 debe dropear las SELECT publicas antiguas antes de crear las nuevas.

## Reglas publicas objetivo

Estas reglas son la fuente de verdad para las SELECT publicas de Fase 3.3:

| Tabla | Regla publica |
| --- | --- |
| `businesses` | `is_active = true`. |
| `catalog_pages` | negocio activo + `catalog_pages.is_active = true`. |
| `catalog_categories` | negocio activo + `catalog_categories.is_active = true` + catalogo padre activo. |
| `catalog_products` | negocio activo + `catalog_products.is_available = true` + categoria padre activa + catalogo padre activo. |
| `promotions` | negocio activo + `status = 'active'` + `starts_at IS NULL OR starts_at <= now()` + `ends_at IS NULL OR ends_at >= now()`. |
| `about` | negocio activo. |
| `faq` | negocio activo + `faq.is_active = true`. |
| `gallery_albums` | negocio activo + `gallery_albums.is_active = true`. |
| `gallery_photos` | negocio activo + `gallery_photos.is_active = true` + album padre activo. |
| `blog` | negocio activo + `is_published = true` + `published_at IS NOT NULL` + `published_at <= hoy America/Havana`. |

Nota de fechas:

- `blog.published_at` es `DATE`; debe compararse contra `((now() AT TIME ZONE 'America/Havana')::date)` para igualar Fase 2.
- `promotions.starts_at` y `promotions.ends_at` son `TIMESTAMPTZ`; compararlas contra `now()` es semanticamente correcto porque representan instantes absolutos. Usar "hoy America/Havana" para promociones seria menos preciso que el service actual, que compara `Date` contra timestamps completos.

## Matriz final por tabla

### `businesses`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Solo filas con `is_active = true`. |
| SELECT `authenticated_sin_rol` | Igual que `anon`: solo negocios activos. |
| SELECT `business_admin` | Su negocio aunque este inactivo: `is_active OR is_business_admin(id)`. |
| SELECT `platform_admin` | Todos, cubierto por `is_business_admin(id)` o `is_platform_admin()`. |
| INSERT `business_admin` | No permitido. |
| INSERT `platform_admin` | Permitido como hoy por `businesses_insert_superadmin`. |
| UPDATE `business_admin` | Permitido sobre su negocio. Las columnas quedan limitadas por mutations, no por RLS. |
| UPDATE `platform_admin` | Permitido sobre todos. |
| DELETE `business_admin` | No permitido. |
| DELETE `platform_admin` | Permitido como hoy. |
| Notas | La SELECT debe permitir admin sobre negocios inactivos; si no, `getAdminContext(slug)` y superadmin romperian. |

### `business_admins`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Nada. |
| SELECT `authenticated_sin_rol` | Sus propias filas: `user_id = auth.uid()`. Necesario para `getAdminContext()`. |
| SELECT `business_admin` | Sus propias filas. Recomendacion: no abrir membresias del mismo negocio todavia, porque no hay UI/patron actual de gestion por tenant. |
| SELECT `platform_admin` | Todas las filas, recomendado para superadmin futuro de membresias. |
| INSERT `business_admin` | No permitido. |
| INSERT `platform_admin` | Permitido, conservando semantica actual. |
| UPDATE `business_admin` | No permitido. |
| UPDATE `platform_admin` | No requerido; tabla sin campos editables salvo PK y `created_at`. |
| DELETE `business_admin` | No permitido. |
| DELETE `platform_admin` | Permitido, conservando semantica actual. |
| Notas | Cambiar SELECT a `user_id = auth.uid() OR is_platform_admin()`. |

### `platform_admins`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Nada. |
| SELECT `authenticated_sin_rol` | Solo su propia fila si existe: `user_id = auth.uid()`. Necesario para `getSuperAdminContext()`. |
| SELECT `business_admin` | Solo su propia fila si tambien fuera platform admin; en la practica nada adicional. |
| SELECT `platform_admin` | Todas las filas, recomendado para auditoria/gestion futura. |
| INSERT `business_admin` | No permitido. |
| INSERT `platform_admin` | Mantener restringido; idealmente service role o flujo dedicado posterior. |
| UPDATE `business_admin` | No permitido. |
| UPDATE `platform_admin` | No permitido por ahora. |
| DELETE `business_admin` | No permitido. |
| DELETE `platform_admin` | No permitido por ahora desde cliente autenticado. |
| Notas | Cambiar SELECT a `user_id = auth.uid() OR is_platform_admin()` si se agrega helper. No abrir escritura. |

### `catalog_pages`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo + `is_active = true`. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Todas las paginas de catalogo de su negocio. |
| SELECT `platform_admin` | Todas. |
| INSERT `business_admin` | Permitido para su negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio. |
| UPDATE `business_admin` | Permitido para su negocio. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | Nueva SELECT: `public_catalog_page OR is_business_admin(business_id)`. Conservar policies de escritura. |

### `catalog_categories`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo + categoria activa + catalogo padre activo. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Todas las categorias de su negocio. |
| SELECT `platform_admin` | Todas. |
| INSERT `business_admin` | Permitido para su negocio; recomendado validar que `catalog_id` pertenezca al mismo negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio; tambien deberia respetar padre del mismo negocio. |
| UPDATE `business_admin` | Permitido para su negocio; si se permite mover de catalogo, validar padre. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | Fase 3.3 puede limitar solo SELECT; validacion de padre puede quedar como hardening adicional si se quiere reducir blast radius. |

### `catalog_products`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo + producto disponible + categoria padre activa + catalogo padre activo. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Todos los productos de su negocio. |
| SELECT `platform_admin` | Todos. |
| INSERT `business_admin` | Permitido para su negocio; validar que `category_id` pertenezca al mismo negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio; tambien deberia respetar padre del mismo negocio. |
| UPDATE `business_admin` | Permitido para su negocio; validar nuevo `category_id` si cambia. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | La app ya valida categoria en mutations, pero RLS deberia cubrir API directa en una fase de hardening. |

### `promotions`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo + `status = 'active'` + ventana vigente por `TIMESTAMPTZ`. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Todas las promociones de su negocio. |
| SELECT `platform_admin` | Todas. |
| INSERT `business_admin` | Permitido para su negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio. |
| UPDATE `business_admin` | Permitido para su negocio. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | Usar `now()` para `starts_at/ends_at`. La zona local no cambia la comparacion de instantes `TIMESTAMPTZ`. |

### `about`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Fila `about` de su negocio aunque el negocio este inactivo. |
| SELECT `platform_admin` | Todas. |
| INSERT `business_admin` | Permitido para su negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio. |
| UPDATE `business_admin` | Permitido para su negocio. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | No hay flag `is_active`; no revisar modulo `about` en RLS para Fase 3.3. |

### `faq`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo + `is_active = true`. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Todas las FAQs de su negocio. |
| SELECT `platform_admin` | Todas. |
| INSERT `business_admin` | Permitido para su negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio. |
| UPDATE `business_admin` | Permitido para su negocio. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | Nueva SELECT debe replicar el filtro publico de `faq.service.ts`. |

### `gallery_albums`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo + `is_active = true`. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Todos los albumes de su negocio. |
| SELECT `platform_admin` | Todos. |
| INSERT `business_admin` | Permitido para su negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio. |
| UPDATE `business_admin` | Permitido para su negocio. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | Nueva SELECT debe replicar el filtro publico de `gallery.service.ts` para albumes. |

### `gallery_photos`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo + foto activa + album padre activo. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Todas las fotos de su negocio. |
| SELECT `platform_admin` | Todas. |
| INSERT `business_admin` | Permitido para su negocio; recomendado validar que `album_id` pertenezca al mismo negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio; tambien deberia respetar padre del mismo negocio. |
| UPDATE `business_admin` | Permitido para su negocio; validar padre si se permite mover foto. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | La mutation actual no valida explicitamente `album_id` en `createPhoto`; la ruta admin lo resuelve antes, pero RLS podria endurecerlo despues. |

### `blog`

| Operacion | Regla objetivo |
| --- | --- |
| SELECT `anon` | Negocio activo + `is_published = true` + `published_at IS NOT NULL` + `published_at <= ((now() AT TIME ZONE 'America/Havana')::date)`. |
| SELECT `authenticated_sin_rol` | Igual que `anon`. |
| SELECT `business_admin` | Todos los posts de su negocio. |
| SELECT `platform_admin` | Todos. |
| INSERT `business_admin` | Permitido para su negocio. |
| INSERT `platform_admin` | Permitido para cualquier negocio. |
| UPDATE `business_admin` | Permitido para su negocio. |
| UPDATE `platform_admin` | Permitido para cualquier negocio. |
| DELETE `business_admin` | Permitido para su negocio. |
| DELETE `platform_admin` | Permitido para cualquier negocio. |
| Notas | La fecha debe usar America/Havana para coincidir con `blog.service.ts`. |

## Helpers SQL recomendados

### `is_business_admin(bid uuid)`

- Existe: si, en `004_business_admins.sql`.
- `SECURITY DEFINER`: si, y debe seguir asi.
- Recursion RLS: la evita porque consulta `business_admins` y `platform_admins` sin depender de sus policies.
- Recomendacion: conservarlo y usarlo para excepcion admin en SELECT de contenido.

### `is_platform_admin()`

- Existe: no.
- `SECURITY DEFINER`: si.
- Recursion RLS: debe evitarla consultando `platform_admins` como definer.
- Recomendacion: agregarlo en 3.3 para policies de `business_admins`, `platform_admins` y operaciones de plataforma. Implementacion conceptual:

```sql
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
$$;
```

### `is_public_business(bid uuid)`

- Existe: no.
- `SECURITY DEFINER`: si, si consulta `businesses` desde policies de otras tablas.
- Recursion RLS: conviene que sea definer para no depender de `businesses_select_public` mientras otras policies se evaluan.
- Recomendacion: agregarlo o usar `EXISTS` directo con cuidado. Helper sugerido:

```sql
CREATE OR REPLACE FUNCTION is_public_business(bid uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM businesses
    WHERE id = bid AND is_active = true
  )
$$;
```

### `is_page_module_enabled(bid uuid, module_id text)`

- Existe: no.
- `SECURITY DEFINER`: si, si se implementa.
- Recursion RLS: consultaria `businesses`; definer evitaria dependencia circular.
- Recomendacion: evitarlo en 3.3 por la decision Opcion A. Considerarlo solo si se normaliza la configuracion efectiva de modulos.

### `havana_today()`

- Existe: no.
- `SECURITY DEFINER`: no hace falta; no consulta tablas.
- Recursion RLS: no aplica.
- Recomendacion: opcional. Se puede usar expresion inline `((now() AT TIME ZONE 'America/Havana')::date)` para evitar otro helper. Si se agrega, que sea `STABLE`.

### Helpers de padres activos

- Existe: no.
- `SECURITY DEFINER`: si, si consultan tablas con RLS.
- Recursion RLS: pueden evitar recursiones y simplificar policies.
- Recomendacion: opcional para legibilidad en 3.3:
  - `is_public_catalog_page(catalog_id uuid)`
  - `is_public_category(category_id uuid)`
  - `is_public_gallery_album(album_id uuid)`

## Estrategia concreta para migracion 3.3

Nombre sugerido:

- `supabase/migrations/005_harden_public_read_policies.sql`

Orden recomendado:

1. Crear helper `is_platform_admin()`.
2. Crear helper `is_public_business(bid uuid)`.
3. Crear helpers opcionales de padres publicos, o usar `EXISTS` inline.
4. Dropear todas las SELECT publicas antiguas con `USING (true)`.
5. Recrear SELECT de `businesses`.
6. Recrear SELECT de tablas internas:
   - `business_admins_select_self` con self + platform admin.
   - `platform_admins_select_self` con self + platform admin.
7. Recrear SELECT de contenido con patron:
   - `(regla_publica) OR is_business_admin(business_id)`.
8. Conservar policies de escritura existentes.
9. Opcional: agregar hardening `WITH CHECK` de padres en una migracion posterior si se quiere separar riesgos.

Policies SELECT antiguas a dropear:

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
- `business_admins_select_self` si se amplia para platform admins.
- `platform_admins_select_self` si se amplia para platform admins.

Policies SELECT nuevas a crear:

- `businesses_select_public_or_admin`
- `business_admins_select_self_or_platform`
- `platform_admins_select_self_or_platform`
- `catalog_pages_select_public_or_admin`
- `catalog_categories_select_public_or_admin`
- `catalog_products_select_public_or_admin`
- `promotions_select_public_or_admin`
- `about_select_public_or_admin`
- `faq_select_public_or_admin`
- `gallery_albums_select_public_or_admin`
- `gallery_photos_select_public_or_admin`
- `blog_select_public_or_admin`

Policies de escritura a conservar:

- `businesses_insert_superadmin`
- `businesses_update_admin`
- `businesses_delete_superadmin`
- `business_admins_insert_superadmin`
- `business_admins_delete_superadmin`
- `catalog_pages_insert_admin`, `catalog_pages_update_admin`, `catalog_pages_delete_admin`
- `catalog_categories_insert_admin`, `catalog_categories_update_admin`, `catalog_categories_delete_admin`
- `catalog_products_insert_admin`, `catalog_products_update_admin`, `catalog_products_delete_admin`
- `promotions_insert_admin`, `promotions_update_admin`, `promotions_delete_admin`
- `about_insert_admin`, `about_update_admin`, `about_delete_admin`
- `faq_insert_admin`, `faq_update_admin`, `faq_delete_admin`
- `gallery_albums_insert_admin`, `gallery_albums_update_admin`, `gallery_albums_delete_admin`
- `gallery_photos_insert_admin`, `gallery_photos_update_admin`, `gallery_photos_delete_admin`
- `blog_insert_admin`, `blog_update_admin`, `blog_delete_admin`

## Riesgos de romper admin/superadmin

- Si `businesses` SELECT no incluye excepcion admin, `getAdminContext(slug)` no podra resolver negocios inactivos para admins.
- Si las SELECT de contenido no incluyen `OR is_business_admin(business_id)`, el admin dejara de ver borradores, inactivos, no disponibles, pausados, vencidos y futuros.
- `getAllBusinesses()` y `getBusinessById()` son usados por superadmin. Platform admin debe poder leer todos los negocios.
- `getSuperAdminContext()` necesita seguir pudiendo leer su propia fila de `platform_admins`.
- `getAdminContext()` necesita seguir pudiendo leer su propia fila de `business_admins` y su propia fila de `platform_admins`.
- Las comparaciones de fecha de blog deben usar America/Havana; si usan UTC podrian ocultar/publicar posts un dia antes o despues.
- Si se agregan checks de modulos en RLS ahora, una fila con `modules = {}` podria ocultar contenido aunque el resolver TypeScript lo considere segun defaults.

## Checklist de pruebas despues de aplicar 3.3

Pruebas con `anon`:

- Negocio activo visible; negocio inactivo no visible.
- Catalogo activo visible; catalogo/categoria inactivos no visibles.
- Producto disponible visible; producto no disponible no visible.
- Promocion activa vigente visible; pausada, vencida y futura no visibles.
- Blog publicado con fecha de hoy/pasada visible; borrador, sin fecha y futuro no visible.
- Album/foto activos visibles; album/foto inactivos no visibles.
- FAQ activa visible; FAQ inactiva no visible.
- About visible solo para negocio activo.
- `business_admins` y `platform_admins` no visibles.

Pruebas con `authenticated_sin_rol`:

- Mismo acceso publico que `anon`.
- Puede consultar solo sus propias filas en `business_admins`/`platform_admins`, si existen.
- No puede escribir en ninguna tabla de negocio/contenido.

Pruebas con `business_admin`:

- Puede leer su negocio aunque este inactivo.
- Puede leer todo el contenido de su negocio, incluyendo borradores/inactivos/futuros/no disponibles.
- No puede leer contenido privado de otros negocios.
- Puede ejecutar CRUD de contenido de su negocio.
- No puede crear/eliminar negocios ni administrar `business_admins`.

Pruebas con `platform_admin`:

- Puede leer todos los negocios y todo el contenido.
- Puede crear/editar/eliminar negocios segun flujos actuales.
- Puede operar mutations de cualquier negocio.
- Puede leer `business_admins` y `platform_admins` si se amplia SELECT.

Validacion tecnica:

- `npm.cmd run lint`
- `npm.cmd run build`
- Smoke test de rutas publicas con modulos encendidos/apagados.
- Smoke test de panel admin con contenido inactivo y negocio inactivo.
- Smoke test de superadmin: listar, crear, editar, branding, modulos y eliminar negocio.

## Validacion de este documento

- `npm.cmd run lint`: OK.
  - Salida relevante: `eslint`.
- `npm.cmd run build`: OK.
  - Salida relevante: `Next.js 16.2.4 (Turbopack)`, compiled successfully, TypeScript OK, static pages generated OK.
- `git status --short`:
  - `?? docs/audits/phase-3-rls-target-matrix.md`
- `git diff --stat`:
  - Sin salida. El archivo es nuevo y no trackeado, por eso no aparece en `git diff --stat`.
- `git diff`:
  - Sin salida. El archivo es nuevo y no trackeado, por eso no aparece en `git diff`.
