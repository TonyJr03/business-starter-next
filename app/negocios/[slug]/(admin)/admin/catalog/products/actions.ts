'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getAdminContext,
  productCreateSchema,
  productUpdateSchema,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

// ─── Crear ────────────────────────────────────────────────────────────────────

export async function createProductAction(
  slug: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = {
    name:          String(formData.get('name')          ?? ''),
    description:   String(formData.get('description')   ?? '') || undefined,
    categoryId:    String(formData.get('categoryId')     ?? ''),
    moneyAmount:   String(formData.get('moneyAmount')    ?? '0'),
    moneyCurrency: String(formData.get('moneyCurrency')  ?? 'CUP'),
    isAvailable:   formData.get('isAvailable')  === 'on',
    isFeatured:    formData.get('isFeatured')   === 'on',
    badge:         String(formData.get('badge') ?? '') || undefined,
    sortOrder:     String(formData.get('sortOrder')      ?? '0'),
  }

  const parsed = productCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await createProduct(ctxResult.ctx, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/catalog/products?created=1`)
}

// ─── Actualizar ───────────────────────────────────────────────────────────────

export async function updateProductAction(
  slug: string,
  id: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = {
    name:          String(formData.get('name')          ?? ''),
    description:   String(formData.get('description')   ?? '') || undefined,
    categoryId:    String(formData.get('categoryId')     ?? ''),
    moneyAmount:   String(formData.get('moneyAmount')    ?? '0'),
    moneyCurrency: String(formData.get('moneyCurrency')  ?? 'CUP'),
    isAvailable:   formData.get('isAvailable')  === 'on',
    isFeatured:    formData.get('isFeatured')   === 'on',
    badge:         String(formData.get('badge') ?? '') || undefined,
    sortOrder:     String(formData.get('sortOrder')      ?? '0'),
  }

  const parsed = productUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updateProduct(ctxResult.ctx, id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: result.field }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/catalog/products?updated=1`)
}

// ─── Eliminar ─────────────────────────────────────────────────────────────────

export async function deleteProductAction(
  slug: string,
  id: string,
  // prevState y formData requeridos por la firma de useActionState, no se usan en delete
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const result = await deleteProduct(ctxResult.ctx, id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/catalog/products?deleted=1`)
}
