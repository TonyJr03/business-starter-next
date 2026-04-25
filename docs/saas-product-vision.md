# Visión de Producto SaaS — Directorio de Negocios Locales

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Sprint:** S12.5 — Evaluación arquitectónica SaaS  
**Estado:** Borrador validado

---

## 1. Qué es la plataforma

La plataforma es un **directorio digital de negocios locales con presencia web individual para cada negocio**, orientado al mercado cubano.

No es una sola web de un negocio. Es una infraestructura que:

- Publica un **directorio público** donde cualquier visitante puede descubrir negocios locales.
- Genera un **sitio web propio para cada negocio** bajo su propio subdominio (`negocio.plataforma.com`).
- Ofrece a cada negocio un **panel de administración** para gestionar su contenido de forma autónoma.
- Es operada de forma centralizada por un **superadmin** (el operador de la plataforma).

### En una frase

> Una vitrina digital colectiva donde cada negocio tiene su propia tienda, gestionada por su dueño, visible al mundo bajo un dominio unificado.

---

## 2. Propuesta de valor

| Para quién | Propuesta |
|---|---|
| **Negocios locales** | Presencia web profesional sin necesidad de crear un sitio desde cero. Gestión propia del catálogo, promociones y contenido. |
| **Visitantes** | Un solo lugar donde descubrir y contactar negocios locales verificados. |
| **Operador de la plataforma** | Administrar todos los negocios desde un panel central. Escalar sin código por cliente. |

---

## 3. Modelo de plataforma

### Visión objetivo (Fase 2 arquitectónica+)

```
www.plataforma.com                  → Directorio público (todos los negocios)
cafe-la-esquina.plataforma.com      → Sitio del negocio "Café La Esquina"
libreria-moderna.plataforma.com     → Sitio del negocio "Librería Moderna"
...
admin.plataforma.com                → Panel del superadmin (operador)
cafe-la-esquina.plataforma.com/admin → Panel del dueño del negocio
```

Cada negocio:
- Tiene un **slug único** (ej: `cafe-la-esquina`) que determina su subdominio.
- Tiene un **admin independiente** accesible desde su propio subdominio.
- Comparte la misma **infraestructura, base de datos y código**.

### MVP (ahora) — Rutas con path

```
www.plataforma.com                           → Directorio público (todos los negocios)
www.plataforma.com/negocios/cafe-la-esquina  → Sitio del negocio "Café La Esquina"
www.plataforma.com/negocios/libreria-moderna → Sitio del negocio "Librería Moderna"
...
www.plataforma.com/admin                                 → Panel del superadmin (operador)
www.plataforma.com/negocios/cafe-la-esquina/admin        → Panel del dueño del negocio
```

**Por qué el MVP usa paths en lugar de subdominios:**
- Vercel Hobby es gratuito (subdominios requieren Vercel Pro $20/mes).
- Cero configuración DNS — se despliega inmediatamente.
- El cambio a subdominios es solo de routing, no de datos ni lógica. La migración está planificada.

Ver [`docs/saas/multi-tenant-architecture.md`](./multi-tenant-architecture.md) para detalles técnicos de la decisión y roadmap de migración.

---

## 4. Actores del sistema

### 4.1 Visitante (público, sin cuenta)

El visitante es cualquier persona que accede a la plataforma sin autenticarse.

**Puede:**
- Navegar el directorio público y descubrir negocios.
- Ver el sitio individual de cualquier negocio:
  - Página de inicio con resumen del negocio.
  - Catálogo de productos o servicios.
  - Promociones activas.
  - Información de contacto y horarios.
  - Galería de fotos.
  - Página "Nosotros".
  - Preguntas frecuentes.
  - Blog.
- Iniciar contacto o hacer un pedido vía **WhatsApp** (botón CTA).
- Compartir la página de un negocio.

**No puede:**
- Acceder a ningún panel de administración.
- Crear una cuenta por sí mismo (no hay registro público en el MVP).
- Ver contenido de otros negocios desde el panel.

---

### 4.2 Admin de Negocio (dueño o gestor del negocio)

El admin de negocio es la persona responsable de mantener actualizado el sitio de su negocio. Accede mediante usuario y contraseña a `/admin` bajo su subdominio.

**Puede:**

#### Información del negocio
- Editar nombre, descripción corta y descripción larga.
- Actualizar horarios de atención.
- Editar datos de contacto: teléfono, WhatsApp, email.
- Gestionar redes sociales: Instagram, Facebook, Telegram, etc.

#### Catálogo
- Crear, editar y eliminar categorías.
- Crear, editar y eliminar productos o servicios:
  - Nombre, descripción, precio, imágenes, disponibilidad.
  - Etiquetas (tags) y badges (nuevo, popular, agotado, etc.).

#### Promociones
- Crear, editar y eliminar promociones con:
  - Título, descripción, fechas de vigencia.
  - Estado: activa, próxima, pausada, expirada.
  - Productos o categorías asociados.

#### Imágenes
- Subir fotos a la galería del negocio.
- Asignar fotos a productos.
- Actualizar imagen de portada y logo.

#### Blog
- Crear, editar y eliminar entradas de blog.
- Publicar o despublicar artículos.

#### Pedidos vía WhatsApp *(futuro)*
- Ver historial de mensajes/pedidos recibidos por WhatsApp (cuando se integre el bot o bandeja de entrada).

**No puede:**
- Ver o modificar datos de otros negocios.
- Activar/desactivar módulos de su sitio (eso lo gestiona el superadmin).
- Cambiar su propio subdominio o configuración de acceso.
- Eliminar su cuenta o el negocio.

---

### 4.3 Superadmin (operador de la plataforma)

El superadmin es quien opera la plataforma. Tiene acceso a un panel centralizado que le permite gestionar todos los negocios.

**Puede:**

#### Gestión de negocios
- Crear un nuevo negocio (onboarding manual): nombre, slug, datos iniciales.
- Activar o desactivar un negocio (hace que su sitio sea visible o no).
- Ver todos los negocios registrados con su estado.
- Acceder al panel de cualquier negocio (vista de impersonación).
- Crear y revocar usuarios admin para cada negocio.

#### Configuración de módulos
- Activar o desactivar módulos por negocio:
  - Catálogo, Promociones, Galería, Blog, FAQ.
- Configurar parámetros visuales o de contenido que el admin de negocio no puede cambiar.

#### Plataforma
- Ver métricas globales: negocios activos, tráfico total *(futuro)*.
- Gestionar el contenido del directorio público.
- Configurar categorías o tipos de negocios a nivel plataforma.

**En el futuro:**
- Gestionar planes y facturación por negocio.
- Controlar onboarding self-service: aprobar o rechazar solicitudes.
- Enviar comunicaciones a todos los admins de negocio.

---

## 5. Partes públicas y privadas

### Público (sin autenticación)

| Ruta | Descripción |
|---|---|
| `www.plataforma.com` | Directorio: listado de todos los negocios activos |
| `www.plataforma.com/[categoria]` | Filtro por tipo de negocio *(futuro)* |
| `{slug}.plataforma.com/` | Home del negocio |
| `{slug}.plataforma.com/catalog` | Catálogo |
| `{slug}.plataforma.com/promotions` | Promociones |
| `{slug}.plataforma.com/about` | Nosotros |
| `{slug}.plataforma.com/contact` | Contacto |
| `{slug}.plataforma.com/faq` | Preguntas frecuentes |
| `{slug}.plataforma.com/gallery` | Galería |
| `{slug}.plataforma.com/blog` | Blog |
| `{slug}.plataforma.com/blog/[slug]` | Artículo individual |

### Privado — Admin de negocio (requiere autenticación)

| Ruta | Descripción |
|---|---|
| `{slug}.plataforma.com/admin` | Dashboard del negocio |
| `{slug}.plataforma.com/admin/catalog` | Gestión de catálogo *(sprint 13)* |
| `{slug}.plataforma.com/admin/promotions` | Gestión de promociones *(sprint 13)* |
| `{slug}.plataforma.com/admin/gallery` | Gestión de imágenes *(futuro)* |
| `{slug}.plataforma.com/admin/blog` | Gestión de blog *(futuro)* |
| `{slug}.plataforma.com/admin/settings` | Ajustes del negocio *(futuro)* |

### Privado — Superadmin (requiere rol especial)

| Ruta | Descripción |
|---|---|
| `admin.plataforma.com` | Panel centralizado *(futuro)* |
| `admin.plataforma.com/businesses` | Listado de todos los negocios |
| `admin.plataforma.com/businesses/new` | Crear nuevo negocio |
| `admin.plataforma.com/businesses/[id]` | Configurar negocio específico |

---

## 6. Módulos configurables por negocio

Cada negocio puede tener activos o inactivos los siguientes módulos. La activación la controla el superadmin en el MVP; en el futuro, el propio admin de negocio podría hacerlo dentro de su plan.

| Módulo | Descripción | Activable por |
|---|---|---|
| **Catálogo** | Productos y servicios con categorías | Superadmin |
| **Promociones** | Ofertas con fechas y reglas | Superadmin |
| **Galería** | Álbum de fotos del negocio | Superadmin |
| **Blog** | Artículos y novedades | Superadmin |
| **FAQ** | Preguntas frecuentes | Superadmin |
| **Carrito** | Pedido con selección múltiple *(futuro)* | Superadmin |
| **Reseñas** | Valoraciones de clientes *(futuro)* | Superadmin |

Los módulos desactivados no aparecen en la navegación ni en el sitio público. El sistema ya soporta esto hoy mediante `modules.pages[id].enabled`.

---

## 7. Roadmap integrado: Producto + Arquitectura

Este roadmap une dos dimensiones:
- **Hitos de producto**: Qué capacidades se ofrecen a cada actor.
- **Hitos de arquitectura multi-tenant**: Cómo evoluciona la infraestructura técnica.

### MVP (Ahora — Sprint S12-S13)

**Producto:**
- Directorio público funcional: listado de negocios activos.
- Sitio público de cada negocio: catálogo, promociones, contacto, blog, FAQ, galería.
- Panel de admin por negocio: CRUD de catálogo y promociones (S13).
- Admin del negocio puede editar información básica del negocio.
- Onboarding manual por superadmin en el panel (futuro S14).

**Arquitectura:**
- Multi-tenant path-based: `/negocios/[slug]` como identificador de tenant.
- Vercel Hobby (gratuito).
- Bases de datos en Supabase con columna `business_id` en todas las tablas.
- RLS (Row-Level Security) activo para aislar datos entre tenants.
- Middleware centralizado que resuelve el tenant desde la URL.

---

### Fase 2 arquitectónica (Futuro — Cuando se justifique Vercel Pro)

**Producto:**
- (Continúan las capacidades de MVP)
- Estadísticas básicas por negocio: visitas, clics en WhatsApp.
- Gestión de imágenes desde panel (upload directo).

**Arquitectura:**
- Multi-tenant subdomain-based: `[slug].plataforma.com`.
- Vercel Pro ($20/mes) con DNS wildcard.
- Middleware extrae slug del hostname en lugar del path.
- El resto del código no cambia — mismo schema de DB, misma lógica.

---

### Fase 3 — Onboarding self-service (Producto)

**Producto:**
- Formulario de registro para nuevos negocios.
- Superadmin aprueba o rechaza solicitudes.
- Configuración inicial automática (slug generado, datos por defecto).

**Arquitectura:**
- Sin cambios — usa la arquitectura de Fase 2 que ya está en lugar.

---

### Fase 4 — Planes y facturación (Producto)

**Producto:**
- Definición de planes: Gratuito, Básico, Pro.
- Límites por plan: número de productos, módulos, imágenes.
- Pasarela de pago integrada.
- Panel de facturación para superadmin.
- Panel de suscripción para admin de negocio.

**Arquitectura:**
- Tabla `subscriptions` en Supabase.
- Webhook de pasarela integrado.
- Sin cambios de tenancy — sigue siendo subdomain-based.

---

### Fase 5 arquitectónica — Dominios personalizados (Opcional, premium)

**Producto:**
- El negocio puede usar su dominio propio (`cafelaesquina.com`).
- El subdominio sigue siendo fallback.
- Requiere plan Pro mínimo.

**Arquitectura:**
- Tabla `business_domains` en Supabase.
- Middleware resuelve tenant por hostname exacto primero, luego por slug.
- Vercel API para provisionar certificados SSL.
- Sin cambios al resto del código.

---

### Fase 6 — Comunicación y engagement

**Producto:**
- Bandeja de entrada de pedidos WhatsApp en el panel del negocio.
- Notificaciones (email o push) al recibir un pedido.
- Sistema básico de reseñas de clientes.

**Arquitectura:**
- Sin cambios de tenancy — continúa con lo anterior.

---

### Fase 7 — Analíticas

**Producto:**
- Dashboard de métricas por negocio: visitas, conversiones WhatsApp, horarios pico.
- Vista agregada en el superadmin: KPIs globales de la plataforma.

**Arquitectura:**
- Sin cambios de tenancy — continúa con lo anterior.

---

## 8. Principios de diseño del producto

1. **Un código, muchos negocios.** La misma aplicación sirve a todos los tenants. No hay instancias separadas por cliente.

2. **El negocio es la unidad central.** Todo gira alrededor del `business_id` / `slug`. No hay datos sin dueño.

3. **El superadmin es el operador.** No hay burocracia de autoservicio en las primeras fases. El control centralizado permite calidad y velocidad.

4. **WhatsApp es el canal primario de conversión.** No hay carrito de pago ni checkout online en el MVP. El CTA siempre lleva a WhatsApp.

5. **Módulos como interruptores.** Si un negocio no tiene blog, no existe para ese negocio. Sin páginas vacías, sin confusión para el visitante.

6. **Cuba primero.** Precios en CUP, contexto local, bajo ancho de banda. La UI debe funcionar bien en conexiones lentas y móviles básicos.

7. **Simple de administrar.** El dueño del negocio no es necesariamente técnico. El panel debe ser tan claro que no necesite manual.

---

## 9. Estado actual vs visión objetivo

| Dimensión | Estado actual (S12) | MVP (S12-S13) | Fase 2+ (Futuro) |
|---|---|---|---|
| Tenancy | 1 negocio hardcodeado (`globalConfig`) | Path-based: `/negocios/[slug]` | Subdomain-based: `[slug].plataforma.com` |
| Routing | Monolítico | Multi-tenant por middleware | Multi-tenant por middleware (mismo código) |
| Admin | Login + dashboard básico | CRUD de catálogo y promociones | + Upload de imágenes, estadísticas |
| Directorio público | No existe | ✅ Listado de negocios activos | ✅ Mismo |
| Módulos | Config en código | Config en código (activables desde superadmin) | Config en DB (togglable desde ambos) |
| Onboarding | Manual en código | Manual en panel del superadmin | Self-service + aprobación |
| Planes | No existe | No existe (MVP es único plan) | Gratuito / Básico / Pro (Fase 4) |
| Dominios custom | No aplica | No (solo paths) | ✅ Disponible como premium (Fase 5) |
| Facturaión | No existe | No existe | Fase 4+ |

---

## Referencias cruzadas

- [`docs/saas/multi-tenant-architecture.md`](./multi-tenant-architecture.md) — Decisión técnica de tenancy: por qué path-based para MVP, migración a subdominios en Fase 2, dominios custom en Fase 5.
- [`docs/saas/framework-evaluation-astro-vs-next.md`](./framework-evaluation-astro-vs-next.md) — Evaluación formal Astro vs Next.js. Decisión: continuar en Astro hasta S13, migrar a Next.js en S14 (antes de multi-tenant + superadmin).

*Este documento es la referencia de producto para las decisiones de arquitectura SaaS del sprint S12.5. Define qué es el producto, qué actores participan, qué modules existen, y el roadmap integrado (producto + arquitectura). El documento hermano, `multi-tenant-architecture.md`, contiene las decisiones técnicas subyacentes.*
