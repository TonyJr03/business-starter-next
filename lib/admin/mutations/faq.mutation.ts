import { z } from 'zod'
import { rowToFaqItem } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { FaqItem } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const faqItemCreateSchema = z.object({
  question:  z.string().min(1, 'La pregunta es obligatoria').max(500),
  answer:    z.string().min(1, 'La respuesta es obligatoria').max(2000),
  category:  z.string().max(100).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive:  z.boolean().default(true),
})

export const faqItemUpdateSchema = faqItemCreateSchema.partial()

export type FaqItemCreateInput = z.infer<typeof faqItemCreateSchema>
export type FaqItemUpdateInput = z.infer<typeof faqItemUpdateSchema>

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createFaqItem(
  ctx: AdminContext,
  input: FaqItemCreateInput,
): Promise<MutationResult<FaqItem>> {
  const { data, error } = await ctx.supabase
    .from('faq')
    .insert({
      business_id: ctx.businessId,
      question:    input.question,
      answer:      input.answer,
      category:    input.category  ?? null,
      sort_order:  input.sortOrder,
      is_active:   input.isActive,
    })
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo crear la pregunta. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToFaqItem(data) }
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateFaqItem(
  ctx: AdminContext,
  id: string,
  input: FaqItemUpdateInput,
): Promise<MutationResult<FaqItem>> {
  const patch: Record<string, unknown> = {}
  if (input.question  !== undefined) patch.question   = input.question
  if (input.answer    !== undefined) patch.answer     = input.answer
  if (input.category  !== undefined) patch.category   = input.category ?? null
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder
  if (input.isActive  !== undefined) patch.is_active  = input.isActive

  const { data, error } = await ctx.supabase
    .from('faq')
    .update(patch)
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar la pregunta. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Pregunta no encontrada.' }

  return { ok: true, data: rowToFaqItem(data) }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteFaqItem(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('faq')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) {
    return { ok: false, error: 'No se pudo eliminar la pregunta. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
