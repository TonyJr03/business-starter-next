# Business Starter — Next.js

Plantilla multi-tenant para sitios web de negocios locales. Construida con Next.js (App Router), Supabase y Tailwind CSS v4.

## Stack

- **Next.js** — App Router, Server Components, Server Actions
- **Supabase** — base de datos PostgreSQL + autenticación
- **Tailwind CSS v4** — estilos con design tokens en `src/styles/tokens.css`
- **TypeScript** — modo estricto

## Estructura

```
src/
  app/
    negocios/[slug]/
      (public)/     # Sitio público del negocio
      admin/        # Panel de administración (auth + panel protegido)
  actions/          # Server Actions compartidas
  components/       # UI, secciones, admin, público y superadmin
  config/           # Defaults de plataforma
  lib/              # Supabase, persistencia, módulos, branding, admin
  services/         # Capa de lectura pública
  styles/           # Tokens CSS y estilos base
  types/            # Tipos TypeScript compartidos
  proxy.ts          # Proxy de Next.js para tenant header y guards optimistas
supabase/           # Migraciones y seed
```

## Puesta en marcha

### 1. Variables de entorno

Copia el fichero de ejemplo y rellena tus credenciales de Supabase:

```bash
cp .env.example .env.local
```

Variables requeridas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 2. Base de datos

Con Supabase CLI en local:

```bash
supabase start
supabase db push
```

O aplica las migraciones de `supabase/migrations/` en tu proyecto cloud.

### 3. Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Multi-tenant

Cada negocio tiene su propia ruta `/negocios/[slug]/`. El slug se resuelve desde la cabecera `x-tenant-slug` inyectada por `src/proxy.ts`.

El panel de administración está en `/negocios/[slug]/admin/` y requiere autenticación mediante Supabase Auth.
