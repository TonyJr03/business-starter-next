'use server'

/**
 * Acciones de autenticación
 *
 * Server Actions para login y logout de ambas áreas de administración.
 * Usan Supabase Auth real — no placeholders.
 *
 * Admin:      loginAction / logoutAction       (tenant, requieren slug)
 * Superadmin: superadminLoginAction / superadminLogoutAction  (plataforma)
 */

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type LoginState = { error: string } | null

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * Autentica al admin del tenant con email y password.
 *
 * Diseñada para usarse con `useActionState`:
 *   const bound = loginAction.bind(null, slug)
 *   const [state, formAction] = useActionState(bound, null)
 *
 * Redirige a /negocios/[slug]/admin si la autenticación es exitosa.
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

  redirect(`/negocios/${slug}/admin`)
}

/**
 * Invalida la sesión y redirige al login del tenant.
 *
 * Uso: <form action={logoutAction.bind(null, slug)}>
 */
export async function logoutAction(slug: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect(`/negocios/${slug}/admin/login`)
}

// ─── Superadmin ───────────────────────────────────────────────────────────────

/**
 * Autentica al superadmin de plataforma.
 *
 * Diseñada para usarse con `useActionState` sin slug bound:
 *   const [state, formAction] = useActionState(superadminLoginAction, null)
 *
 * Redirige a /superadmin si la autenticación es exitosa.
 */
export async function superadminLoginAction(
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

  redirect('/superadmin')
}

/**
 * Invalida la sesión y redirige al login de plataforma.
 *
 * Uso: <form action={superadminLogoutAction}>
 */
export async function superadminLogoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/superadmin/login')
}
