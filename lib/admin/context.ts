import { getUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resolveBusinessBySlug } from '@/services/business.service'

// ─── Tipos del cliente Supabase ───────────────────────────────────────────────

export type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

// ─── Contexto admin ───────────────────────────────────────────────────────────

/**
 * Contexto resuelto del admin: sesión + negocio listos para mutaciones.
 *
 * SEGURIDAD:
 *   · Todas las mutaciones usan ctx.businessId en .eq('business_id', ctx.businessId)
 *   · Garantiza que un usuario nunca puede editar datos de otro negocio.
 *   · El layout admin ya verifica sesión; getAdminContext() es una segunda
 *     barrera que protege específicamente los Server Actions.
 */
export interface AdminContext {
  /** UUID del negocio actual (de la tabla `businesses`). */
  businessId: string
  /** UUID del usuario autenticado en Supabase Auth. */
  userId: string
  /** Email del usuario autenticado (para mostrar en la UI). */
  userEmail: string
  /** Cliente Supabase con la sesión activa del request entrante. */
  supabase: SupabaseServerClient
}

export type AdminContextResult =
  | { ok: true; ctx: AdminContext }
  | { ok: false; error: string }

/**
 * Resuelve y valida el contexto admin para un slug de negocio dado.
 *
 * Verifica:
 *   1. Sesión activa (getUser contra el servidor de Auth)
 *   2. Negocio existente en DB para el slug dado
 *
 * Usar al inicio de cada Server Action que muta datos admin:
 *   const result = await getAdminContext(slug)
 *   if (!result.ok) return { ok: false, error: result.error }
 *   const { ctx } = result
 */
export async function getAdminContext(slug: string): Promise<AdminContextResult> {
  const user = await getUser()
  if (!user) {
    return { ok: false, error: 'No autenticado' }
  }

  const business = await resolveBusinessBySlug(slug)
  if (!business) {
    return { ok: false, error: 'Negocio no encontrado' }
  }

  const supabase = await createSupabaseServerClient()

  return {
    ok: true,
    ctx: {
      businessId: business.id,
      userId: user.id,
      userEmail: user.email ?? '',
      supabase,
    },
  }
}

// ─── Estado de Server Actions ─────────────────────────────────────────────────

/**
 * Estado retornado por Server Actions, compatible con useActionState de React.
 *
 * En el camino feliz, la acción llama a redirect() antes de retornar,
 * por lo que el cliente solo ve este estado en caso de error.
 *
 * Uso:
 *   const [state, formAction, pending] = useActionState(myAction, null)
 */
export type AdminActionState = {
  ok: boolean
  error?: string
  /** Campo específico con error, para resaltar en el formulario. */
  field?: string
} | null

// ─── Resultado de mutaciones ──────────────────────────────────────────────────

/**
 * Tipo resultado para funciones de mutación internas.
 * Las mutaciones retornan este tipo; los Server Actions lo convierten
 * en AdminActionState o redirect().
 */
export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string }
