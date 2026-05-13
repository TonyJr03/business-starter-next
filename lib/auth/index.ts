import type { User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Devuelve el usuario autenticado verificado contra el servidor de Auth.
 * Retorna `null` si no hay sesión activa o ante cualquier error.
 *
 * Usar en Server Components, Route Handlers y Server Functions.
 * No usar en Client Components — usar el cliente browser para eso.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) return null

  return data.user
}

/**
 * Indica si hay un usuario autenticado en la sesión actual.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return user !== null
}

/**
 * Indica si el usuario actual es superadmin de plataforma.
 *
 * Consulta la tabla `platform_admins` — solo el propio usuario puede
 * leer su fila (ver RLS en 003_platform_admins.sql).
 * Retorna `false` ante cualquier error o si no hay sesión.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return false

  return data !== null
}
