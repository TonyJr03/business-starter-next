'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getAdminContext,
  promotionCreateSchema,
  promotionUpdateSchema,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extrae los campos del formulario de promoción. */
function extractRaw(formData: FormData) {
  const badge      = String(formData.get('badge') ?? '')
  const ruleType   = String(formData.get('ruleType') ?? '')
  const ruleValue  = String(formData.get('ruleValue') ?? '')

  return {
    title:           String(formData.get('title')          ?? ''),
    description:     String(formData.get('description')    ?? '') || undefined,
    status:          String(formData.get('status')         ?? 'active'),
    discountLabel:   String(formData.get('discountLabel')  ?? '') || undefined,
    startsAt:        String(formData.get('startsAt')       ?? '') || undefined,
    endsAt:          String(formData.get('endsAt')         ?? '') || undefined,
    sortOrder:       String(formData.get('sortOrder')      ?? '0'),
    ruleType:        ruleType  || undefined,
    ruleValue:       ruleValue || undefined,
    ruleDescription: String(formData.get('ruleDescription') ?? '') || undefined,
    // badge no pertenece al schema de promoción — ignorado aquí
    _badge: badge,
  }
}

// ─── Crear ────────────────────────────────────────────────────────────────────

export async function createPromotionAction(
  slug: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)
  const parsed = promotionCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const formErrors = parsed.error.flatten().formErrors
    if (formErrors.length > 0) {
      return { ok: false, error: formErrors[0]!, field: 'startsAt' }
    }
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await createPromotion(ctxResult.ctx, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/promotions?created=1`)
}

// ─── Actualizar ───────────────────────────────────────────────────────────────

export async function updatePromotionAction(
  slug: string,
  id: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  // Validación manual de fechas para el schema partial
  if (raw.startsAt && raw.endsAt) {
    if (new Date(raw.startsAt) >= new Date(raw.endsAt)) {
      return { ok: false, error: 'La fecha de inicio debe ser anterior a la fecha de fin.', field: 'startsAt' }
    }
  }

  const parsed = promotionUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updatePromotion(ctxResult.ctx, id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/promotions?updated=1`)
}

// ─── Eliminar ─────────────────────────────────────────────────────────────────

export async function deletePromotionAction(
  slug: string,
  id: string,
  // prevState y formData requeridos por la firma de useActionState, no se usan en delete
  _prevState: AdminActionState, 
  _formData: FormData,           
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const result = await deletePromotion(ctxResult.ctx, id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/promotions?deleted=1`)
}
