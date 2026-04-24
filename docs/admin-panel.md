# Panel Admin — Migración a Next.js

**Fase**: M7 (Sprint de migración básica)  
**Estado**: ✅ Funcional — CRUDs operativos con seguridad básica  
**Fecha**: Abril 2026

---

## 📍 Rutas Disponibles

Todas las rutas están bajo `/negocios/[slug]/admin/` y requieren sesión activa.

### Dashboard
- **`GET /negocios/[slug]/admin`** → Dashboard (placeholder, sin datos aún)

### Catálogo
- **`GET /negocios/[slug]/admin/catalog/categories`** → Listar categorías
- **`GET /negocios/[slug]/admin/catalog/categories/new`** → Formulario crear
- **`GET /negocios/[slug]/admin/catalog/categories/[id]`** → Formulario editar
- **`POST /negocios/[slug]/admin/catalog/categories`** → Crear (Server Action)
- **`POST /negocios/[slug]/admin/catalog/categories/[id]`** → Editar (Server Action)
- **`POST /negocios/[slug]/admin/catalog/categories/[id]/delete`** → Eliminar (Server Action)

- **`GET /negocios/[slug]/admin/catalog/products`** → Listar productos
- **`GET /negocios/[slug]/admin/catalog/products/new`** → Formulario crear
- **`GET /negocios/[slug]/admin/catalog/products/[id]`** → Formulario editar
- **`POST /negocios/[slug]/admin/catalog/products`** → Crear (Server Action)
- **`POST /negocios/[slug]/admin/catalog/products/[id]`** → Editar (Server Action)
- **`POST /negocios/[slug]/admin/catalog/products/[id]/delete`** → Eliminar (Server Action)

### Promociones
- **`GET /negocios/[slug]/admin/promotions`** → Listar promociones
- **`GET /negocios/[slug]/admin/promotions/new`** → Formulario crear
- **`GET /negocios/[slug]/admin/promotions/[id]`** → Formulario editar
- **`POST /negocios/[slug]/admin/promotions`** → Crear (Server Action)
- **`POST /negocios/[slug]/admin/promotions/[id]`** → Editar (Server Action)
- **`POST /negocios/[slug]/admin/promotions/[id]/delete`** → Eliminar (Server Action)

### Ajustes del Negocio
- **`GET /negocios/[slug]/admin/settings`** → Formulario ajustes
- **`POST /negocios/[slug]/admin/settings`** → Guardar ajustes (Server Action)

---

## ✅ Operaciones Soportadas

### Categorías
- ✅ Crear con validación de nombre único
- ✅ Editar nombre, descripción, orden, estado
- ✅ Eliminar (con protección: falla si tiene productos)
- ✅ Slug generado automáticamente

### Productos
- ✅ Crear con validación de nombre único
- ✅ Editar todos los campos
- ✅ Eliminar sin restricciones
- ✅ Slug generado automáticamente
- ✅ Validación de categoría propietaria
- ✅ Campo badge (new, popular, offer)

### Promociones
- ✅ Crear con validación de fechas
- ✅ Editar parcialmente (no requiere todos los campos)
- ✅ Eliminar sin restricciones
- ✅ Estados: active, upcoming, paused, expired
- ✅ Una regla simple por promoción

### Ajustes del Negocio
- ✅ Editar nombre, descripción, contacto
- ✅ Editar ubicación y país
- ✅ Gestionar redes sociales (Instagram, Facebook, Telegram, Twitter, YouTube)
- ✅ Gestionar horarios de atención (7 días, horas de apertura/cierre, cierre total)

---

## 🔒 Seguridad Implementada

### Autenticación
- Todas las rutas requieren sesión válida contra Supabase Auth
- `getUser()` verifica JWT en cada Server Action
- Redirección a login si no hay sesión

### Aislamiento de Datos
- Cada usuario solo ve/modifica su propio negocio
- `.eq('business_id', ctx.businessId)` en **todas** las queries y mutaciones
- Validación de ownership en operaciones sensibles (ej: validar categoría antes de asignarla a producto)

### Validación
- Esquemas Zod en todos los CRUDs
- Errores amigables, sin exponer detalles internos de BD
- Campos requeridos y validaciones de formato

### RLS en Base de Datos
- Políticas definidas en `20260424000000_admin_write_policies.sql`
- INSERT, UPDATE, DELETE protegidas por `business_id`

---

## ⚠️ Limitaciones Deliberadas (M7)

### Formularios
- Sin subida de imágenes (image_url siempre NULL)
- Sin editor WYSIWYG de descripción
- Sin búsqueda o filtros en listados
- Sin paginación

### Promociones
- Una sola regla por promoción
- Sin selector visual de productos/categorías
- Sin builder de reglas avanzadas

### Ajustes
- Sin importar/exportar configuración
- Sin historial de cambios
- Sin vista previa de cambios

### General
- Sin RBAC (Role-Based Access Control) avanzado
- Solo un rol: admin del negocio
- Sin auditoría de quién hizo qué y cuándo

---

## 🔮 Planeado para Fases Posteriores

### M8 — Mejoras UI/UX
- Subida de imágenes con preview
- Buscador en listados
- Paginación
- Exportación CSV de datos

### M9 — Promociones Avanzadas
- Builder visual de reglas complejas
- Selector de productos/categorías en promociones
- Múltiples reglas por promoción
- Segmentación por cliente

### M10+ — Infraestructura Admin
- RBAC: roles staff, analista, etc.
- Auditoría de cambios
- Historial completo
- Reportes básicos

---

## 🏗️ Arquitectura Breve

```
app/negocios/[slug]/
├── (admin)/
│   ├── layout.tsx                    # Layout principal con sidebar
│   ├── AdminNav.tsx                  # Navegación con rutas activas
│   ├── admin/
│   │   ├── catalog/
│   │   │   ├── categories/           # CRUD categorías
│   │   │   └── products/             # CRUD productos
│   │   ├── promotions/               # CRUD promociones
│   │   └── settings/                 # Ajustes del negocio
│   └── page.tsx                      # Dashboard (placeholder)

lib/admin/
├── context.ts                        # getAdminContext() — verificación + contexto
├── mutations/
│   ├── categories.ts                 # Mutaciones categorías
│   ├── products.ts                   # Mutaciones productos
│   ├── promotions.ts                 # Mutaciones promociones
│   ├── settings.ts                   # Mutaciones ajustes
│   └── index.ts                      # Barrel export

components/admin/
├── AdminNav.tsx                      # Navegación con highlight activo
├── SubmitButton.tsx                  # Botón submit con estado pendiente
└── index.ts                          # Barrel export
```

---

## 🚀 Para Empezar

### Acceder al Admin
1. Login en `/negocios/[slug]/login`
2. Navegar a `/negocios/[slug]/admin`
3. Ver sidebar con links: Categorías, Productos, Promociones, Ajustes

### Crear Primera Categoría
1. Click en "Categorías"
2. Click en "+ Nueva categoría"
3. Rellenar nombre (obligatorio) y descripción (opcional)
4. Click "Guardar"

### Crear Primer Producto
1. Click en "Productos"
2. Click en "+ Nuevo producto"
3. Seleccionar categoría, nombre, precio
4. Click "Guardar"

---

## 📋 Checklist de Seguridad ✅

- ✅ Autenticación requerida en todas las rutas admin
- ✅ Validación de `business_id` en todas las consultas y mutaciones
- ✅ No se puede editar data de otro negocio
- ✅ Errores genéricos al usuario, sin detalles internos
- ✅ Validación de ownership antes de operaciones sensibles
- ✅ RLS en base de datos como segunda línea de defensa

---

## 📝 Notas Técnicas

### Server Actions
- Todas las mutaciones usan Server Actions (`'use server'`)
- Retornan `AdminActionState` con resultado
- Llaman `revalidatePath()` antes de redirect para invalidar caché

### Validación con Zod v4
- `categoryUpdateSchema`, `productUpdateSchema`, `promotionUpdateSchema` son `.partial()`
- No usan `.refine()` para permitir `.partial()`
- Validaciones adicionales hechas manualmente en las mutaciones si es necesario

### Cache de React
- `resolveBusinessBySlug()` usa `cache()` para deduplicar consultas en el mismo render pass
- Llamarlo en múltiples Server Components no genera N queries

---

## 🔗 Referencias

- **Auth**: `AUTH_FLOW.md`
- **Config**: `config/business-config.ts`, `config/navigation.ts`
- **Tipos**: `types/business-config.ts`, `types/content.ts`
- **Supabase**: `supabase/migrations/`, `supabase/seed.sql`
