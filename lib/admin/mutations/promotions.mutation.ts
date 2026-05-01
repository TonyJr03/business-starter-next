import { z } from 'zod'
import { rowToPromotion } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { Promotion } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

const promotionBaseSchema = z.object({
  title:         z.string().min(1, 'El título es obligatorio').max(200),
  description:   z.string().max(1000).optional(),
  status:        z.enum(['upcoming', 'active', 'expired', 'paused']).default('active'),
  discountLabel: z.string().max(50).optional(),
  startsAt:      z.string().optional(),
  endsAt:        z.string().optional(),
  sortOrder:     z.coerce.number().int().min(0).default(0),
  ruleType:        z.enum(['percentage', 'fixed', 'bogo', 'combo', 'custom']).optional(),
  ruleValue:       z.coerce.number().min(0).optional(),
  ruleDescription: z.string().max(300).optional(),
})

export const promotionCreateSchema = promotionBaseSchema.refine(
  (data) => {
    if (data.startsAt && data.endsAt) {
      return new Date(data.startsAt) < new Date(data.endsAt)
    }
    return true
  },
  {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin.',
    path: ['startsAt'],
  },
)

export const promotionUpdateSchema = promotionBaseSchema.partial()

export type PromotionCreateInput = z.infer<typeof promotionCreateSchema>
export type PromotionUpdateInput = z.infer<typeof promotionUpdateSchema>

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Compone el array rules[] desde los campos simples del formulario. */
function buildRules(input: PromotionCreateInput | PromotionUpdateInput) {
  if (!input.ruleType) return null
  return [{
    type:        input.ruleType,
    value:       input.ruleValue       ?? undefined,
    description: input.ruleDescription ?? undefined,
  }]
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createPromotion(
  ctx: AdminContext,
  input: PromotionCreateInput,
): Promise<MutationResult<Promotion>> {
  const { data, error } = await ctx.supabase
    .from('promotions')
    .insert({
      business_id:    ctx.businessId,
      title:          input.title,
      description:    input.description ?? null,
      status:         input.status,
      discount_label: input.discountLabel ?? null,
      image_url:      null,
      starts_at:      input.startsAt ?? null,
      ends_at:        input.endsAt ?? null,
      rules:          buildRules(input),
      sort_order:     input.sortOrder,
    })
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo crear la promoción. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToPromotion(data) }
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updatePromotion(
  ctx: AdminContext,
  id: string,
  input: PromotionUpdateInput,
): Promise<MutationResult<Promotion>> {
  const patch: Record<string, unknown> = {}
  if (input.title         !== undefined) patch.title          = input.title
  if (input.description   !== undefined) patch.description    = input.description
  if (input.status        !== undefined) patch.status         = input.status
  if (input.discountLabel !== undefined) patch.discount_label = input.discountLabel ?? null
  if (input.startsAt      !== undefined) patch.starts_at      = input.startsAt ?? null
  if (input.endsAt        !== undefined) patch.ends_at        = input.endsAt ?? null
  if (input.sortOrder     !== undefined) patch.sort_order     = input.sortOrder
  // Siempre recalcula rules cuando cambia cualquier campo de la regla
  if (
    input.ruleType        !== undefined ||
    input.ruleValue       !== undefined ||
    input.ruleDescription !== undefined
  ) {
    patch.rules = buildRules(input)
  }

  const { data, error } = await ctx.supabase
    .from('promotions')
    .update(patch)
    .eq('id', id)
    .eq('business_id', ctx.businessId) // RLS: solo el negocio propietario
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar la promoción. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Promoción no encontrada.' }

  return { ok: true, data: rowToPromotion(data) }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deletePromotion(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('promotions')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) {
    return { ok: false, error: 'No se pudo eliminar la promoción. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
