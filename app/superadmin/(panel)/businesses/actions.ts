'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSuperAdminContext } from '@/lib/admin/superadmin-context'
import {
  businessSuperAdminSchema,
  createBusiness,
  updateBusinessById,
  deleteBusiness,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function extractUpdateRaw(formData: FormData) {
  const hours = DAYS.map((day, i) => ({
    day,
    open:     String(formData.get(`hours_open_${i}`)  ?? '09:00'),
    close:    String(formData.get(`hours_close_${i}`) ?? '18:00'),
    isClosed: formData.get(`hours_closed_${i}`) === 'on',
  }))

  return {
    name:             String(formData.get('name')             ?? '').trim(),
    slug:             String(formData.get('slug')             ?? '').trim(),
    shortDescription: String(formData.get('shortDescription') ?? '').trim() || undefined,
    whatsapp:         String(formData.get('whatsapp')         ?? '').trim() || undefined,
    phone:            String(formData.get('phone')            ?? '').trim() || undefined,
    email:            String(formData.get('email')            ?? '').trim() || undefined,
    address:          String(formData.get('address')          ?? '').trim() || undefined,
    city:             String(formData.get('city')             ?? '').trim() || undefined,
    country:          String(formData.get('country')          ?? '').trim() || undefined,
    socialInstagram:  String(formData.get('socialInstagram')  ?? '').trim() || undefined,
    socialFacebook:   String(formData.get('socialFacebook')   ?? '').trim() || undefined,
    socialTelegram:   String(formData.get('socialTelegram')   ?? '').trim() || undefined,
    socialTwitter:    String(formData.get('socialTwitter')    ?? '').trim() || undefined,
    socialYoutube:    String(formData.get('socialYoutube')    ?? '').trim() || undefined,
    isActive:         formData.get('isActive') === 'on',
    hours,
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createBusinessAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw = {
    name:             String(formData.get('name')             ?? '').trim(),
    slug:             String(formData.get('slug')             ?? '').trim(),
    shortDescription: String(formData.get('shortDescription') ?? '').trim() || undefined,
    isActive:         formData.get('isActive') === 'on',
  }

  const parsed = businessSuperAdminSchema.safeParse(raw)
  if (!parsed.success) {
    const errors     = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok:    false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await createBusiness(ctxResult.ctx.supabase, parsed.data)
  if (!result.ok) return { ok: false, error: result.error, field: (result as { field?: string }).field }

  revalidatePath('/superadmin/businesses', 'page')
  redirect(`/superadmin/businesses/${result.data.id}?created=1`)
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateBusinessAction(
  businessId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const raw    = extractUpdateRaw(formData)
  const parsed = businessSuperAdminSchema.safeParse(raw)

  if (!parsed.success) {
    const errors     = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok:    false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updateBusinessById(ctxResult.ctx.supabase, businessId, parsed.data)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/superadmin/businesses/${businessId}`, 'page')
  revalidatePath('/superadmin/businesses', 'page')
  redirect(`/superadmin/businesses/${businessId}?saved=1`)
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteBusinessAction(
  businessId: string,
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const result = await deleteBusiness(ctxResult.ctx.supabase, businessId)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/superadmin/businesses', 'page')
  redirect('/superadmin/businesses?deleted=1')
}
