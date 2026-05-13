import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { SupabaseServerClient } from '@/lib/admin/context'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SuperAdminContext {
  userId: string
  supabase: SupabaseServerClient
}

export type SuperAdminContextResult =
  | { ok: true; ctx: SuperAdminContext }
  | { ok: false; error: string }

// ─── Resolver ────────────────────────────────────────────────────────────────

/**
 * Resuelve y valida el contexto superadmin.
 *
 * Verifica:
 *   1. Sesión activa (getUser contra el servidor de Auth)
 *   2. El usuario está en la tabla platform_admins
 *
 * Usar al inicio de cada Server Action del panel superadmin:
 *   const result = await getSuperAdminContext()
 *   if (!result.ok) return { ok: false, error: result.error }
 *   const { ctx } = result
 */
export async function getSuperAdminContext(): Promise<SuperAdminContextResult> {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) {
    return { ok: false, error: 'No autorizado' }
  }

  return {
    ok: true,
    ctx: {
      userId: user.id,
      supabase,
    },
  }
}
