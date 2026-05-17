import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Crea un cliente Supabase para uso en Server Components, Route Handlers
 * y Server Functions. Siempre crear una instancia nueva por request.
 *
 * `setAll` usa try/catch porque Next.js no permite escribir cookies
 * durante el render de Server Components. Si hay un middleware que
 * gestione el refresco de sesión, esto es seguro de ignorar.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // No se pueden escribir cookies durante el render de un Server Component.
            // Es seguro ignorar si un middleware gestiona el refresco de tokens.
          }
        },
      },
    }
  )
}
