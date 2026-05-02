'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getAdminContext,
  photoCreateSchema,
  photoUpdateSchema,
  createPhoto,
  updatePhoto,
  deletePhoto,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractRaw(formData: FormData) {
  return {
    imageUrl:  String(formData.get('imageUrl')  ?? ''),
    alt:       String(formData.get('alt')        ?? ''),
    caption:   String(formData.get('caption')    ?? '').trim() || undefined,
    sortOrder: String(formData.get('sortOrder')  ?? '0'),
    isActive:  formData.get('isActive') === 'on',
  }
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createPhotoAction(
  slug: string,
  albumId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  const parsed = photoCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await createPhoto(ctxResult.ctx, albumId, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/gallery/${albumId}/photos?created=1`)
}

// ─── Update ────────────────────────────────────────────────────────────────────

export async function updatePhotoAction(
  slug: string,
  albumId: string,
  id: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  const parsed = photoUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updatePhoto(ctxResult.ctx, id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/gallery/${albumId}/photos?updated=1`)
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deletePhotoAction(
  slug: string,
  albumId: string,
  id: string,
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const result = await deletePhoto(ctxResult.ctx, id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/gallery/${albumId}/photos?deleted=1`)
}
