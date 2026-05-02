'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getAdminContext,
  blogPostCreateSchema,
  blogPostUpdateSchema,
  createPost,
  updatePost,
  deletePost,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractRaw(formData: FormData) {
  const body = String(formData.get('body') ?? '')
    .split('\n').map((l) => l.trim()).filter(Boolean)
  const tags = String(formData.get('tags') ?? '')
    .split(',').map((t) => t.trim()).filter(Boolean)

  return {
    title:       String(formData.get('title')       ?? ''),
    summary:     String(formData.get('summary')     ?? ''),
    body,
    publishedAt: String(formData.get('publishedAt') ?? ''),
    author:      String(formData.get('author')      ?? '').trim() || undefined,
    tags:        tags.length > 0 ? tags : undefined,
    isPublished: formData.get('isPublished') === 'on',
  }
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createPostAction(
  slug: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  const parsed = blogPostCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await createPost(ctxResult.ctx, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/blog?created=1`)
}

// ─── Update ────────────────────────────────────────────────────────────────────

export async function updatePostAction(
  slug: string,
  id: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = extractRaw(formData)

  const parsed = blogPostUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updatePost(ctxResult.ctx, id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/blog?updated=1`)
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deletePostAction(
  slug: string,
  id: string,
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const result = await deletePost(ctxResult.ctx, id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/blog?deleted=1`)
}
