import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resolveBusinessBySlug } from '@/services'

// ─── Tipo compartido: cliente Supabase ────────────────────────────────────────

export type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

// ─── Tipos compartidos: Server Actions y mutaciones ───────────────────────────

/**
 * Estado retornado por Server Actions, compatible con useActionState de React.
 *
 * En el camino feliz, la acción llama a redirect() antes de retornar,
 * por lo que el cliente solo ve este estado en caso de error.
 */
export type AdminActionState = {
  ok: boolean
  error?: string
  /** Campo específico con error, para resaltar en el formulario. */
  field?: string
} | null

/**
 * Tipo resultado para funciones de mutación internas.
 * Las mutaciones retornan este tipo; los Server Actions lo convierten
 * en AdminActionState o redirect().
 */
export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string }

// ─── Contexto admin (tenant) ──────────────────────────────────────────────────

/**
 * Contexto resuelto del admin de negocio: sesión + negocio + cliente DB.
 *
 * SEGURIDAD:
 *   · Todas las mutaciones usan ctx.businessId en .eq('business_id', ctx.businessId)
 *   · Garantiza que un usuario nunca puede editar datos de otro negocio.
 */
export interface AdminContext {
  /** UUID del negocio actual (de la tabla `businesses`). */
  businessId: string
  /** Nombre del negocio (para mostrar en el sidebar). */
  businessName: string
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
 *   3. Membresía en business_admins para este negocio
 *
 * Usar al inicio de cada Server Action y página del panel de negocio:
 *   const result = await getAdminContext(slug)
 *   if (!result.ok) return { ok: false, error: result.error }
 *   const { ctx } = result
 */
export async function getAdminContext(slug: string): Promise<AdminContextResult> {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'No autenticado' }
  }

  const business = await resolveBusinessBySlug(slug)
  if (!business) {
    return { ok: false, error: 'Negocio no encontrado' }
  }

  // Verifica membresía o rol de superadmin.
  // Equivale a la lógica de is_business_admin() en SQL:
  //   EXISTS (business_admins WHERE user_id AND business_id)
  //   OR EXISTS (platform_admins WHERE user_id)
  // Esto permite a los superadmins operar sobre cualquier negocio
  // sin necesidad de tener una fila en business_admins.
  const [{ data: membership }, { data: isPlatformAdmin }] = await Promise.all([
    supabase
      .from('business_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('business_id', business.id)
      .maybeSingle(),
    supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!membership && !isPlatformAdmin) {
    return { ok: false, error: 'No autorizado' }
  }

  return {
    ok: true,
    ctx: {
      businessId: business.id,
      businessName: business.name,
      userId: user.id,
      userEmail: user.email ?? '',
      supabase,
    },
  }
}

// ─── Contexto superadmin (plataforma) ─────────────────────────────────────────

/**
 * Contexto resuelto del superadmin: sesión verificada + cliente DB.
 * Análogo a AdminContext pero para el área de plataforma.
 */
export interface SuperAdminContext {
  /** UUID del usuario autenticado en Supabase Auth. */
  userId: string
  /** Email del usuario autenticado (para mostrar en la UI). */
  userEmail: string
  /** Cliente Supabase con la sesión activa del request entrante. */
  supabase: SupabaseServerClient
}

export type SuperAdminContextResult =
  | { ok: true; ctx: SuperAdminContext }
  | { ok: false; error: string }

/**
 * Resuelve y valida el contexto superadmin.
 *
 * Verifica:
 *   1. Sesión activa (getUser contra el servidor de Auth)
 *   2. El usuario está en la tabla platform_admins
 *
 * Usar al inicio de cada Server Action y página del panel superadmin:
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
      userEmail: user.email ?? '',
      supabase,
    },
  }
}
