# Roadmap de consolidación — `business-starter-next`

## Propósito

Este documento define el plan de trabajo para consolidar `business-starter-next` como una plataforma multi-negocio capaz de publicar y administrar sitios web reales de negocios locales.

La prioridad actual no es todavía desarrollar la visión completa de Ubícate como directorio general, sino dejar lista la capacidad de crear, configurar, administrar y publicar sitios individuales de negocios reales dentro de la plataforma.

## Objetivo final de la consolidación

El sistema se considerará listo para cargar un negocio real cuando se cumpla el siguiente flujo:

1. Un superadmin puede crear un negocio nuevo como inactivo.
2. El superadmin o un admin autorizado puede configurar datos básicos, contacto, horarios, ubicación, redes sociales y branding.
3. El superadmin puede activar o desactivar módulos por negocio desde la configuración persistida en base de datos.
4. El negocio puede tener catálogo, categorías, productos o servicios, promociones, contenido informativo e imágenes reales.
5. Las imágenes se suben y gestionan mediante Supabase Storage.
6. El sitio público solo muestra negocios activos y contenido realmente publicable.
7. Un negocio inactivo devuelve 404 en rutas públicas.
8. El contenido inactivo, no disponible, pausado o no publicado queda protegido también a nivel de RLS, no solo oculto por la UI.
9. Un admin de negocio no puede leer ni modificar datos de otro negocio.
10. El superadmin conserva control centralizado sobre negocios, publicación y configuración inicial.

---

# Fase 0 — Preparación y baseline técnico

## Objetivo

Establecer una base estable antes de modificar seguridad, políticas RLS, Storage, servicios públicos o flujos críticos.

## Alcance

Esta fase no agrega funcionalidades nuevas. Su propósito es validar el estado actual del proyecto, confirmar que la migración hacia `src/` quedó consistente y generar un inventario técnico real del sistema.

## Tareas

1. Crear una rama de trabajo para la consolidación.
2. Ejecutar comprobaciones base:
   - `npm run lint`
   - `npm run build`
3. Revisar que la reorganización hacia `src/` no dejó imports rotos, rutas duplicadas o documentación apuntando a ubicaciones antiguas.
4. Crear un inventario del estado actual:
   - rutas públicas existentes,
   - rutas admin existentes,
   - rutas superadmin existentes,
   - services existentes,
   - mappers existentes,
   - mutations existentes,
   - migraciones Supabase existentes,
   - formularios incompletos,
   - módulos parcialmente conectados.
5. Registrar errores encontrados antes de empezar fases de hardening.

## Resultado esperado

Una base técnica verificada, con errores iniciales identificados y sin comenzar todavía cambios de arquitectura sensible.

Estado: Completada

---

# Fase 1 — Reglas de publicación pública

## Objetivo

Garantizar que las rutas públicas respeten correctamente el estado de publicación del negocio.

## Decisión arquitectónica

Un negocio inactivo debe devolver 404 en rutas públicas, pero su panel admin debe seguir accesible para usuarios autorizados, porque un negocio puede estar en preparación antes de publicarse.

## Reglas esperadas

```txt
/negocios/[slug]              -> 404 si business.isActive = false
/negocios/[slug]/catalog      -> 404 si business.isActive = false
/negocios/[slug]/promotions   -> 404 si business.isActive = false
/negocios/[slug]/admin        -> permitido si el usuario es admin o superadmin
/superadmin/businesses/[id]   -> permitido si el usuario es superadmin
```

## Tareas

1. Agregar protección en el layout público del tenant.
2. Evitar aplicar la protección en el layout raíz de `/negocios/[slug]`, porque ese layout envuelve también el panel admin.
3. Revisar metadata pública para evitar exponer datos de negocios inactivos.
4. Establecer la convención:

```ts
if (!business || !business.isActive) notFound()
```

solo dentro del árbol público.

## Resultado esperado

Un negocio inactivo no se ve públicamente, pero puede seguir siendo configurado desde el admin o superadmin.

Estado: Completada

---

# Fase 2 — Separar lectura pública de lectura admin

## Objetivo

Asegurar que los servicios usados por el sitio público solo devuelvan contenido visible para visitantes.

## Decisión arquitectónica

Los services públicos deben estar orientados a visitantes. Las lecturas completas, incluyendo contenido inactivo, pausado, vencido o no publicado, deben quedar reservadas al panel admin o a consultas internas protegidas.

## Tareas

1. Crear o ajustar funciones públicas específicas:
   - `getPublicCatalogs`
   - `getPublicCategories`
   - `getPublicProducts`
   - `getPublicActivePromotions`
   - `getPublicGalleryAlbums`
   - `getPublicGalleryPhotos`
   - `getPublicFaqItems`
   - `getPublicPosts`
2. Ajustar rutas públicas para usar solo funciones públicas.
3. Definir filtros mínimos de publicación:
   - `catalog_pages.is_active = true`
   - `catalog_categories.is_active = true`
   - `catalog_products.is_available = true`
   - promociones activas y dentro de fecha,
   - `faq.is_active = true`
   - `gallery_albums.is_active = true`
   - `gallery_photos.is_active = true`
   - `blog.is_published = true`
4. Mantener fetch directo protegido en páginas admin cuando haga falta mostrar todo el contenido.

## Resultado esperado

La UI pública nunca renderiza contenido desactivado, no disponible, pausado, vencido o no publicado.

Estado: Siguiente fase

---

# Fase 3 — Endurecimiento de RLS para lectura pública

## Objetivo

Proteger el contenido no publicable a nivel de base de datos, no solo desde la interfaz.

## Decisión arquitectónica

La UI no es una barrera de seguridad. La protección real debe estar en PostgreSQL mediante Row Level Security.

## Tareas

1. Crear una nueva migración, por ejemplo:

```txt
005_public_read_policies.sql
```

2. Cambiar la lectura pública de `businesses` para que solo permita negocios activos.
3. Agregar políticas de lectura admin separadas para usuarios autorizados.
4. Ajustar policies públicas de contenido para validar:
   - negocio padre activo,
   - módulo/contenido activo cuando aplique,
   - estado publicable según la tabla.
5. Mantener escritura protegida mediante `is_business_admin(business_id)`.
6. Probar acceso anónimo, autenticado sin rol, admin de negocio y superadmin.

## Resultado esperado

Aunque alguien use directamente la API anónima de Supabase, no podrá leer negocios inactivos ni contenido no publicado.

Estado: Pendiente

---

# Fase 4 — Integridad multi-tenant en mutations

## Objetivo

Evitar que IDs manipulados desde formularios puedan relacionar datos de distintos negocios.

## Regla general

Toda mutation que reciba un ID padre debe verificar que ese recurso padre pertenece a `ctx.businessId`.

## Casos a revisar

- categoría -> catálogo,
- producto -> categoría,
- foto -> álbum,
- promociones con reglas que referencien categorías o productos,
- cualquier contenido relacionado con un recurso padre.

## Tareas

1. Revisar todas las mutations de `src/lib/admin/mutations`.
2. Agregar validaciones explícitas de pertenencia al negocio.
3. Agregar constraints de base de datos cuando aplique.
4. Corregir el guardado de `social` para evitar `null` en columnas `NOT NULL`.
5. Corregir actualización parcial de precios en productos.
6. Mantener la convención de retornar `MutationResult<T>`.

## Resultado esperado

Un admin no puede manipular IDs para conectar, modificar o insertar contenido relacionado con otro tenant.

Estado: Pendiente

---

# Fase 5 — Flujo real de creación de negocio desde superadmin

## Objetivo

Permitir que el superadmin cree un negocio real sin publicarlo accidentalmente.

## Decisión arquitectónica

Un negocio nuevo debe nacer como inactivo.

## Estado inicial recomendado

```txt
is_active = false
modules = {}
branding = {}
contenido vacío
```

## Tareas

1. Cambiar el formulario de creación para que `isActive` no venga marcado por defecto.
2. Cambiar textos de UI para reflejar que el negocio se crea como borrador/inactivo.
3. Mejorar la pantalla de detalle del negocio en superadmin.
4. Mostrar estado de preparación:
   - datos básicos,
   - contacto,
   - ubicación,
   - horarios,
   - módulos,
   - branding,
   - contenido,
   - imágenes,
   - estado de publicación.
5. Mantener por ahora la creación manual de admins de negocio.
6. Documentar el proceso manual para asignar admins mediante Supabase.

## Resultado esperado

El superadmin puede crear, preparar y publicar un negocio solo cuando esté completo.

Estado: Pendiente

---

# Fase 6 — Supabase Storage e imágenes

## Objetivo

Implementar un flujo real de subida, gestión y uso de imágenes desde Supabase Storage.

## Decisión arquitectónica

Las imágenes se almacenarán en Supabase Storage con paths aislados por negocio.

## Estructura recomendada

```txt
businesses/{businessId}/logo/...
businesses/{businessId}/catalog/...
businesses/{businessId}/products/...
businesses/{businessId}/promotions/...
businesses/{businessId}/gallery/...
businesses/{businessId}/blog/...
```

## Tareas

1. Crear bucket de imágenes.
2. Definir si el bucket será público o privado. Para esta fase se recomienda público para lectura, con escritura protegida.
3. Crear policies de Storage:
   - lectura pública,
   - escritura solo para admins del negocio,
   - actualización y borrado solo para admins del negocio.
4. Crear helpers de servidor:
   - `uploadBusinessImage`
   - `deleteBusinessImage`
5. Crear un componente reutilizable de subida de imagen.
6. Integrar subida de imágenes progresivamente:
   - logo,
   - catálogo,
   - productos,
   - promociones,
   - galería,
   - about,
   - blog si aplica.
7. Validar formato, tamaño, nombre y path.

## Resultado esperado

Un admin puede subir imágenes reales sin pegar URLs manualmente.

Estado: Pendiente

---

# Fase 7 — Consolidación de módulos admin y contenido real

## Objetivo

Hacer que cada módulo importante sea usable para cargar contenido real.

## Módulos a revisar

- datos del negocio,
- módulos,
- branding,
- catálogo,
- promociones,
- about,
- FAQ,
- galería,
- blog,
- contacto, horarios, ubicación y redes sociales.

## Tareas

1. Revisar formularios existentes.
2. Mejorar empty states.
3. Asegurar instrucciones claras para administradores no técnicos.
4. Permitir editar contenido aunque el módulo esté inactivo públicamente.
5. Crear una checklist de preparación del negocio.

## Resultado esperado

El sistema no solo funciona técnicamente, sino que permite cargar contenido real de manera entendible.

Estado: Pendiente

---

# Fase 8 — Branding real por negocio

## Objetivo

Permitir que cada negocio tenga identidad visual básica sin romper la consistencia del sistema.

## Tareas

1. Revisar pantalla actual de branding.
2. Validar colores hex.
3. Evitar combinaciones ilegibles.
4. Permitir resetear a defaults.
5. Definir campos mínimos:
   - color primario,
   - color secundario,
   - color de acento,
   - footer,
   - logo,
   - `themeKey` si aplica.
6. Evitar plantillas avanzadas en esta fase.

## Resultado esperado

Cada negocio puede verse propio sin introducir sobreingeniería visual.

Estado: Pendiente

---

# Fase 9 — QA multi-tenant y pruebas manuales de seguridad

## Objetivo

Comprobar que el sistema resiste casos reales y manipulaciones básicas.

## Matriz mínima de pruebas

### Visitante

- Ve negocio activo.
- No ve negocio inactivo.
- No ve contenido inactivo.
- No accede a módulos desactivados.

### Admin de negocio

- Entra a su panel.
- No entra al panel de otro negocio.
- No modifica datos de otro negocio manipulando IDs.
- Puede preparar contenido inactivo de su negocio.

### Superadmin

- Entra a `/superadmin`.
- Crea negocios.
- Edita negocios.
- Accede al admin de cualquier negocio.
- Publica y despublica negocios.

### Supabase API

- Usuario anónimo no lee negocio inactivo.
- Usuario anónimo no lee contenido no publicable.
- Usuario autenticado sin rol no escribe nada.
- Admin de un negocio no escribe en otro negocio.

## Resultado esperado

Confianza razonable en el aislamiento multi-tenant antes de subir contenido real.

Estado: Pendiente

---

# Fase 10 — Documentación operativa

## Objetivo

Actualizar la documentación para que el proyecto no dependa solo de memoria o conversaciones.

## Documentos recomendados

```txt
docs/technical-overview.md
docs/supabase-setup.md
docs/storage.md
docs/rls-policies.md
docs/admin-manual.md
docs/superadmin-manual.md
docs/real-business-checklist.md
```

## Tareas

1. Sincronizar nombres de tablas, rutas y archivos con el código real.
2. Eliminar referencias a nombres antiguos.
3. Documentar flujos reales de admin y superadmin.
4. Documentar proceso manual temporal para crear admins de negocio.
5. Documentar configuración de Supabase Storage y RLS.

## Resultado esperado

Codex, el equipo futuro y el propio desarrollador pueden entender el sistema sin romper patrones.

Estado: Pendiente

---

# Fase 11 — Preparación de despliegue

## Objetivo

Dejar lista una versión deployable para cargar un primer negocio real.

## Tareas

1. Revisar `.env.example`.
2. Confirmar variables necesarias:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Evitar usar `service_role` en runtime normal salvo tareas controladas.
4. Revisar configuración de `next/image`.
5. Ejecutar:

```bash
npm run lint
npm run build
```

6. Desplegar en el entorno elegido.
7. Crear un negocio real inactivo.
8. Cargar contenido.
9. Revisar como visitante.
10. Publicar.

## Resultado esperado

Primera versión funcional lista para uso real con un negocio cargado manualmente.

Estado: Pendiente

---

# Orden recomendado de ejecución

```txt
1. Baseline técnico
2. 404 público para negocios inactivos
3. Services públicos seguros
4. RLS de lectura pública
5. Mutations multi-tenant e integridad
6. Superadmin: negocio inactivo por defecto + flujo de carga
7. Supabase Storage
8. UX admin y checklist de publicación
9. Branding
10. QA multi-tenant
11. Documentación
12. Deploy y carga del primer negocio real
```

---

# Criterio de finalización

La consolidación estará completa cuando se pueda crear, configurar, cargar, revisar y publicar un negocio real, con contenido e imágenes reales, manteniendo seguridad multi-tenant, RLS coherente y una experiencia usable para administradores no técnicos.

## Estado actual del roadmap

- Fase 0 — Completada
- Fase 1 — Completada
- Fase 2 — Pendiente / siguiente fase
