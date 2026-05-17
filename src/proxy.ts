import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extrae el slug del tenant de rutas con forma /negocios/[slug]/... */
function extractSlug(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  // segments[0] = 'negocios', segments[1] = slug
  return segments.length >= 2 ? segments[1] : null
}

/** True si la ruta es un área admin del tenant. */
const ADMIN_PATTERN = /^\/negocios\/[^/]+\/admin(\/|$)/

/** True si la ruta es el área superadmin de plataforma. */
const SUPERADMIN_PATTERN = /^\/superadmin(\/|$)/

/**
 * Guard optimista: lee la sesión del cookie (sin red) y redirige al login
 * si no hay sesión activa. Si la hay, devuelve la respuesta con no-store.
 *
 * `requestHeaders` es opcional — el guard de admin lo usa para propagar
 * el header `x-tenant-slug`; el de superadmin no lo necesita.
 */
async function optimisticGuard(
  request: NextRequest,
  loginUrl: string,
  requestHeaders?: Headers
): Promise<NextResponse> {
  const init = requestHeaders ? { request: { headers: requestHeaders } } : undefined
  let response = NextResponse.next(init)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next(init)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }

  // Evitar que el navegador cachee páginas protegidas: sin esto, el botón
  // atrás tras logout puede mostrar HTML protegido desde la caché.
  response.headers.set('Cache-Control', 'no-store')
  return response
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Guard superadmin ────────────────────────────────────────────────────────
  // Primera capa (optimista). La verificación de rol se hace en el layout.
  // Se excluye /superadmin/login para evitar bucle infinito.
  if (SUPERADMIN_PATTERN.test(pathname) && !pathname.endsWith('/superadmin/login')) {
    return optimisticGuard(request, '/superadmin/login')
  }

  // Sólo actúa sobre /negocios/* — el resto pasa sin tocar.
  if (!pathname.startsWith('/negocios')) {
    return NextResponse.next()
  }

  const slug = extractSlug(pathname)

  // Sin slug válido, deja pasar (la página correspondiente mostrará 404).
  if (!slug) return NextResponse.next()

  // Propaga el slug como header para que layouts y Server Components lo lean
  // sin necesidad de parsear el pathname de nuevo.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-slug', slug)

  // ── Guard de admin ──────────────────────────────────────────────────────────
  // Primera capa (optimista). La verificación de sesión se hace en el layout.
  // Se excluye /admin/login para evitar bucle infinito.
  if (ADMIN_PATTERN.test(pathname) && !pathname.endsWith('/admin/login')) {
    return optimisticGuard(request, `/negocios/${slug}/admin/login`, requestHeaders)
  }

  // ── Rutas públicas del tenant ───────────────────────────────────────────────
  return NextResponse.next({ request: { headers: requestHeaders } })
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Corre sólo en rutas de negocio. Los assets estáticos y rutas de API
// quedan fuera por diseño del matcher.
export const config = {
  matcher: ['/negocios/:path*', '/superadmin/:path*'],
}
