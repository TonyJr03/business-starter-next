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

// ─── Proxy ────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Sólo actúa sobre /negocios/* — el resto pasa sin tocar.
  if (!pathname.startsWith('/negocios')) {
    return NextResponse.next()
  }

  const slug = extractSlug(pathname)

  // Sin slug válido, deja pasar (la página correspondiente mostrará 404).
  if (!slug) {
    return NextResponse.next()
  }

  // Propaga el slug como header para que layouts y Server Components lo lean
  // sin necesidad de parsear el pathname de nuevo.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-slug', slug)

  // ── Guard de admin ──────────────────────────────────────────────────────────
  // Comprobación optimista (cookie): no hace llamadas a la DB.
  if (ADMIN_PATTERN.test(pathname)) {
    // Usamos una variable mutable para que `setAll` pueda recrear la respuesta
    // con las cookies actualizadas si Supabase necesita refrescar el token.
    let response = NextResponse.next({ request: { headers: requestHeaders } })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Actualiza las cookies de la request…
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            // …y recrea la respuesta para propagarlas al cliente.
            response = NextResponse.next({ request: { headers: requestHeaders } })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Comprobación optimista: lee la sesión del cookie, sin red.
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const loginUrl = new URL(`/negocios/${slug}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Evitar que el navegador cachee las páginas admin.
    // Sin esto, el botón atrás tras logout puede mostrar HTML protegido
    // desde la caché del navegador sin hacer una nueva request al servidor.
    response.headers.set('Cache-Control', 'no-store')

    return response
  }

  // ── Rutas públicas del tenant ───────────────────────────────────────────────
  return NextResponse.next({ request: { headers: requestHeaders } })
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Corre sólo en rutas de negocio. Los assets estáticos y rutas de API
// quedan fuera por diseño del matcher.
export const config = {
  matcher: ['/negocios/:path*'],
}
