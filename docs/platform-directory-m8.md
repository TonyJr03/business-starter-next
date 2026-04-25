# M8 — Directorio público de negocios

## Resumen
M8 implementa la **superficie central de la plataforma SaaS multi-tenant** en Next.js. La raíz `/` muestra un directorio público de negocios activos con navegación clara hacia cada sitio de tenant.

---

## Estructura de rutas

```
/                                → Directorio público (plataforma central)
  └─ Layout: (platform)/layout.tsx
  └─ Componentes: PlatformHeader, PlatformFooter
  └─ Header y Footer neutros (sin branding del tenant)

/negocios/[slug]                 → Sitio público del tenant
  └─ Layout: negocios/[slug]/layout.tsx (resuelve negocio, inyecta branding)
  └─ Sub-rutas públicas: (public)/* (header/footer con marca del tenant)
```

**Separación clara:** La plataforma usa `bg-zinc-50` y colores neutros. El tenant usa `--color-primary` y paleta de marca.

---

## Flujo de datos

### 1. Consulta: `listActiveBusinesses()`

**Ubicación:** `lib/tenant/index.ts`

```typescript
export async function listActiveBusinesses(): Promise<BusinessDirectoryItem[]>
```

**Filtros aplicados:**
- `is_active = true` — solo negocios publicables
- Ordenado alfabéticamente por `name`

**Campos seleccionados** (ligero):
```sql
SELECT id, slug, name, short_description, city
FROM businesses
WHERE is_active = true
ORDER BY name ASC
```

**Manejo de errores:**
- Si Supabase falla → devuelve `[]` (array vacío)
- La UI renderiza estado vacío limpio

### 2. Mapeo de tipos

**En BD (Supabase):** `BusinessDirectoryRow`
```typescript
{
  id: string
  slug: string
  name: string
  short_description: string | null
  city: string | null
}
```

**En dominio:** `BusinessDirectoryItem` (idéntico)

**En UI:** `BusinessCard` recibe `BusinessDirectoryItem`

### 3. Renderizado

**Componente:** `components/platform/BusinessCard.tsx`
- Tarjeta responsiva, grid 1→2→3 columnas
- Franja de color en la parte superior
- Campos opcionales renderizados solo si existen
- Link a `/negocios/[slug]`

---

## Migración de BD

**Archivo:** `supabase/migrations/20260425000000_businesses_is_active.sql`

**Cambio aplicado:**
```sql
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX idx_businesses_is_active ON businesses (is_active);
```

**Default `true`:** Los negocios existentes quedan visibles automáticamente. Cero breaking changes.

---

## Navegación

### Desde directorio → tenant
```
/ (BusinessCard) → /negocios/[slug]
```

### Desde tenant → directorio
```
/negocios/[slug] (Footer) → ← Directorio → /
```

El enlace vuelve discreto en el pie de página (color muted, `text-xs`).

---

## Estado vacío

Si no hay negocios activos, se muestra:
- Icono de tienda
- Título: "No hay negocios disponibles"
- Copy con contexto de desarrollo (tabla `businesses`, filtro `is_active = true`)

Útil para devs en ambiente local o staging.

---

## Qué NO entra en M8

❌ **Búsqueda avanzada** — se planea para M9+  
❌ **Filtros por categoría** — planeado para M9+  
❌ **Panel superadmin** — es M10+  
❌ **Onboarding self-service** — es M11+  
❌ **Analíticas** — es M12+  
❌ **Dominios custom / subdominios** — M13+  
❌ **Facturación** — M14+  

---

## Consideraciones de performance

1. **`cache()` de React** en `resolveBusinessBySlug` → evita viajes duplicados a BD en el mismo render
2. **Selección de campos ligera** en `listActiveBusinesses` → solo 5 campos, no todo el modelo
3. **Índice en `is_active`** → acelera el filtro público incluso con miles de negocios
4. **Server Component puro** — sin hidratación de JavaScript en `/`

---

## Checklist completado M8

- ✅ Layout de plataforma central (PlatformHeader + PlatformFooter)
- ✅ Migración `is_active` a tabla `businesses`
- ✅ Tipos `BusinessDirectoryItem` y `BusinessDirectoryRow`
- ✅ Función `listActiveBusinesses()`
- ✅ Componente `BusinessCard`
- ✅ Página raíz `/` con directorio real
- ✅ Estado vacío robusto
- ✅ Coherencia de navegación (plataforma ↔ tenant)
- ✅ Link discreto al directorio en footer del tenant

---

## Próximos pasos (M9)

- Swap a producción y cierre de migración Astro → Next.js
- Validación final de datos
- Monitoreo de performance
