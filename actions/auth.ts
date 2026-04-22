'use server'

/**
 * Acciones de autenticación
 *
 * Server Actions para login y logout del admin de cada tenant.
 * Usan Supabase Auth real — no placeholders.
 *
 * Uso:
 *   login  → loginAction.bind(null, slug) para pasarle el slug al useActionState
 *   logout → logoutAction.bind(null, slug) como action de un <form>
 */

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type LoginState = { error: string } | null

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Autentica al admin del tenant con email y password.
 *
 * Diseñada para usarse con `useActionState`:
 *   const bound = loginAction.bind(null, slug)
 *   const [state, formAction, isPending] = useActionState(bound, null)
 *
 * - Devuelve `{ error }` si las credenciales son inválidas o los campos vacíos.
 * - Redirige a /negocios/[slug]/admin si la autenticación es exitosa.
 *   (redirect() lanza internamente — la función no retorna en ese caso)
 */
export async function loginAction(
  slug: string,
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Credenciales inválidas. Verificá tu email y contraseña.' }
  }

  // Fuera del bloque de error — redirect() no debe estar en try/catch
  redirect(`/negocios/${slug}/admin`)
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Invalida la sesión del usuario actual y redirige al login del tenant.
 *
 * Diseñada para usarse como action de un <form>:
 *   <form action={logoutAction.bind(null, slug)}>
 *     <button type="submit">Cerrar sesión</button>
 *   </form>
 */
export async function logoutAction(slug: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect(`/negocios/${slug}/login`)
}
