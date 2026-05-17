'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getAdminContext,
  faqItemCreateSchema,
  faqItemUpdateSchema,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractRaw(formData: FormData) {
  return {
    question:  String(formData.get('question')  ?? ''),
    answer:    String(formData.get('answer')    ?? ''),
    category:  String(formData.get('category')  ?? '').trim() || undefined,
    sortOrder: String(formData.get('sortOrder') ?? '0'),
    isActive:  formData.get('isActive') === 'on',
  }
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createFaqItemAction(
  slug: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  const parsed = faqItemCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await createFaqItem(ctxResult.ctx, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/faq?created=1`)
}

// ─── Update ────────────────────────────────────────────────────────────────────

export async function updateFaqItemAction(
  slug: string,
  id: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  const parsed = faqItemUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updateFaqItem(ctxResult.ctx, id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/faq?updated=1`)
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteFaqItemAction(
  slug: string,
  id: string,
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const result = await deleteFaqItem(ctxResult.ctx, id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/faq?deleted=1`)
}
