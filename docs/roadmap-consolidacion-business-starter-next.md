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

`src/services` es la capa de lectura pública para contenido. Las funciones existentes deben mantener sus nombres y devolver solo contenido publicable. `business.service.ts` queda como excepción neutral/plataforma porque resuelve datos base del tenant y también participa en flujos admin/superadmin. Las lecturas completas, incluyendo contenido inactivo, pausado, vencido o no publicado, deben quedar reservadas al panel admin o a consultas internas protegidas.

## Tareas

1. Reformar los contratos existentes en `src/services` sin crear una familia paralela de funciones públicas nuevas.
2. Mantener los nombres actuales de las funciones públicas de contenido.
3. Asegurar que los services de contenido devuelvan solo datos publicables para visitantes.
4. Definir filtros mínimos de publicación:
   - `catalog_pages.is_active = true`
   - `catalog_categories.is_active = true`
   - `catalog_products.is_available = true`
   - promociones activas y dentro de fecha,
   - `faq.is_active = true`
   - `gallery_albums.is_active = true`
   - `gallery_photos.is_active = true`
   - `blog.is_published = true`
5. Mantener `business.service.ts` como excepción neutral/plataforma.
6. Mantener fetch directo protegido en páginas admin cuando haga falta mostrar todo el contenido.

## Resultado esperado

La UI pública nunca renderiza contenido desactivado, no disponible, pausado, vencido o no publicado.

Estado: Completada

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

## Cierre de Fase 3

La Fase 3 también absorbió el hardening de integridad padre-hijo que antes estaba previsto como fase independiente:

- RLS SELECT público endurecido mediante `005_harden_public_read_policies.sql`.
- Integridad padre-hijo protegida con constraints compuestas mediante `006_parent_child_integrity_constraints.sql`.
- Validaciones críticas en `createCategory`, `createProduct` y `createPhoto`.
- No se agregó `WITH CHECK` adicional para padre-hijo; queda como deuda técnica opcional futura si se desea una capa RLS redundante.

Estado: Completada

---

# Fase 4 — Flujo real de creación y edición de negocios desde superadmin

## Objetivo

Permitir que el superadmin cree, revise y edite negocios reales con un flujo consistente antes de cargar contenido público.

## Decisión arquitectónica

Un negocio nuevo debe poder nacer como inactivo para preparación interna. La publicación pública se controla por `is_active`.

## Alcance

- creación real de negocio desde superadmin,
- edición de datos base del negocio,
- slug,
- nombre,
- estado activo/inactivo,
- descripción corta,
- branding básico inicial si aplica,
- configuración de módulos por negocio,
- validaciones,
- errores controlados,
- revisión de mutations superadmin,
- permisos superadmin.

## Tareas

1. Revisar el flujo actual de `/superadmin/businesses/new`.
2. Confirmar que un negocio nuevo puede crearse como inactivo.
3. Revisar edición de slug, nombre, descripción corta y estado activo/inactivo.
4. Revisar configuración de módulos por negocio desde superadmin.
5. Revisar branding básico inicial si aplica.
6. Endurecer validaciones y mensajes de error controlados.
7. Confirmar permisos superadmin y evitar que usuarios sin rol accedan a mutations de plataforma.
8. Mantener la arquitectura separada entre admin de negocio y superadmin.

## Resultado esperado

El superadmin puede crear y preparar negocios reales de forma segura antes de publicar el sitio público.

Estado: Pendiente / siguiente fase

---

# Fase 5 — Configuración inicial del sitio público del negocio

## Objetivo

Completar los datos base que hacen que un sitio público de negocio sea útil y verificable.

## Tareas

1. Configurar contacto.
2. Configurar dirección/ubicación.
3. Configurar teléfonos.
4. Configurar WhatsApp.
5. Configurar redes sociales.
6. Configurar horarios.
7. Revisar descripción pública.
8. Revisar contenido de `about`.
9. Revisar branding visual básico.
10. Revisar secciones públicas activables.

## Resultado esperado

Un negocio puede mostrar información pública básica real sin depender de datos de ejemplo.

Estado: Pendiente

---

# Fase 6 — Catálogo real del negocio

## Objetivo

Consolidar la carga y administración de catálogos, categorías y productos o servicios reales.

## Tareas

1. Revisar flujo de catálogos.
2. Revisar flujo de categorías.
3. Revisar flujo de productos/servicios.
4. Revisar disponibilidad.
5. Revisar destacados.
6. Revisar precios si aplica.
7. Mejorar UX admin para carga repetida.
8. Confirmar empty states, errores y navegación.

## Resultado esperado

Un admin puede cargar un catálogo real de manera cómoda y consistente.

Estado: Pendiente

---

# Fase 7 — Contenido público complementario

## Objetivo

Completar los módulos de contenido que acompañan al catálogo y al perfil público del negocio.

## Alcance

- promociones,
- galería,
- blog/noticias,
- FAQ,
- about,
- estados,
- orden,
- fechas,
- empty states,
- errores.

## Tareas

1. Revisar promociones activas, pausadas, vencidas y futuras.
2. Revisar carga y orden de galería.
3. Revisar blog/noticias.
4. Revisar FAQ.
5. Revisar about.
6. Unificar estados, orden, fechas, empty states y errores.
7. Confirmar que el sitio público solo muestra contenido publicable.

## Resultado esperado

El negocio puede tener contenido público complementario cargado y administrable.

Estado: Pendiente

---

# Fase 8 — Supabase Storage e imágenes reales

## Objetivo

Implementar un flujo real de subida, gestión y uso de imágenes desde Supabase Storage.

## Decisión arquitectónica

Las imágenes se almacenarán en Supabase Storage con paths aislados por negocio.

## Tareas

1. Crear buckets.
2. Definir policies de Storage.
3. Crear helper de upload.
4. Validar tipo/tamaño.
5. Integrar logos.
6. Integrar imágenes de productos.
7. Integrar imágenes de promociones.
8. Integrar galería.
9. Soportar reemplazo/limpieza de imágenes.

## Resultado esperado

Un admin puede subir imágenes reales sin pegar URLs manualmente.

Estado: Pendiente

---

# Fase 9 — Pulido de UX admin y sitio público

## Objetivo

Hacer que la experiencia de administración y navegación pública sea clara para uso real.

## Alcance

- mensajes claros,
- loading states,
- empty states,
- confirmaciones,
- navegación admin,
- consistencia visual,
- formularios más cómodos,
- preview público si aplica.

## Tareas

1. Revisar mensajes de error y éxito.
2. Revisar estados de carga.
3. Revisar empty states.
4. Revisar confirmaciones de acciones destructivas.
5. Mejorar navegación admin.
6. Revisar consistencia visual.
7. Hacer formularios más cómodos para carga repetida.
8. Evaluar preview público si aplica.

## Resultado esperado

Administrar y revisar un negocio real se siente claro, predecible y suficientemente pulido.

Estado: Pendiente

---

# Fase 10 — Carga completa de negocio real piloto

## Objetivo

Cargar un negocio real piloto de inicio a fin y validar el flujo completo.

## Tareas

1. Crear negocio.
2. Asignar admin manualmente.
3. Configurar módulos.
4. Cargar catálogo.
5. Cargar promociones.
6. Cargar imágenes.
7. Revisar sitio público completo.
8. Probar negocio activo/inactivo.
9. Probar permisos.

## Resultado esperado

Existe al menos un negocio real piloto cargado y revisado en la plataforma.

Estado: Pendiente

---

# Fase 11 — Preparación para despliegue/producción

## Objetivo

Dejar lista una versión deployable y operable en producción.

## Tareas

1. Revisar variables de entorno.
2. Preparar Supabase remoto.
3. Aplicar migraciones.
4. Preparar Storage remoto.
5. Ejecutar build final.
6. Documentar despliegue.
7. Revisar seguridad.
8. Crear checklist de producción.

## Resultado esperado

Primera versión funcional lista para producción con un negocio real cargado y probado.

Estado: Pendiente

---

# Orden recomendado de ejecución

```txt
1. Baseline técnico
2. 404 público para negocios inactivos
3. Services públicos seguros
4. RLS de lectura pública e integridad padre-hijo
5. Superadmin: creación y edición real de negocios
6. Configuración inicial del sitio público
7. Catálogo real del negocio
8. Contenido público complementario
9. Supabase Storage e imágenes reales
10. Pulido de UX admin y sitio público
11. Carga completa de negocio real piloto
12. Preparación para despliegue/producción
```

---

# Criterio de finalización

La consolidación estará completa cuando se pueda crear, configurar, cargar, revisar y publicar un negocio real, con contenido e imágenes reales, manteniendo seguridad multi-tenant, RLS coherente y una experiencia usable para administradores no técnicos.

## Estado actual del roadmap

- Fase 0 — Completada
- Fase 1 — Completada
- Fase 2 — Completada
- Fase 3 — Completada
- Fase 4 — Pendiente / siguiente fase
- Fases 5 a 11 — Pendientes
