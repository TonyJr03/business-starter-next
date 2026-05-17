'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getAdminContext,
  categoryCreateSchema,
  categoryUpdateSchema,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractRaw(formData: FormData) {
  return {
    name:        String(formData.get('name')        ?? ''),
    description: String(formData.get('description') ?? '') || undefined,
    sortOrder:   String(formData.get('sortOrder')   ?? '0'),
    isActive:    formData.get('isActive') === 'on',
  }
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createCategoryAction(
  slug: string,
  catalogId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  const parsed = categoryCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await createCategory(ctxResult.ctx, catalogId, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/catalog/${catalogId}/categories?created=1`)
}

// ─── Update ────────────────────────────────────────────────────────────────────

export async function updateCategoryAction(
  slug: string,
  catalogId: string,
  id: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  const parsed = categoryUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updateCategory(ctxResult.ctx, id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/catalog/${catalogId}/categories?updated=1`)
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteCategoryAction(
  slug: string,
  catalogId: string,
  id: string,
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const result = await deleteCategory(ctxResult.ctx, id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/catalog/${catalogId}/categories?deleted=1`)
}
