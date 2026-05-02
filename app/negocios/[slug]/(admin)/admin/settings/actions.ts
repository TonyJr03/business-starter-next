'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getAdminContext,
  settingsUpdateSchema,
  updateSettings,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateSettingsAction(
  slug: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const hours = DAYS.map((day, i) => ({
    day,
    open:     String(formData.get(`hours_open_${i}`)   ?? '09:00'),
    close:    String(formData.get(`hours_close_${i}`)  ?? '18:00'),
    isClosed: formData.get(`hours_closed_${i}`) === 'on',
  }))

  const raw = {
    name:             String(formData.get('name')             ?? ''),
    shortDescription: String(formData.get('shortDescription') ?? '') || undefined,
    whatsapp:         String(formData.get('whatsapp')         ?? '') || undefined,
    phone:            String(formData.get('phone')            ?? '') || undefined,
    email:            String(formData.get('email')            ?? ''),
    address:          String(formData.get('address')          ?? '') || undefined,
    city:             String(formData.get('city')             ?? '') || undefined,
    country:          String(formData.get('country')          ?? '') || undefined,
    socialInstagram:  String(formData.get('socialInstagram')  ?? '') || undefined,
    socialFacebook:   String(formData.get('socialFacebook')   ?? '') || undefined,
    socialTelegram:   String(formData.get('socialTelegram')   ?? '') || undefined,
    socialTwitter:    String(formData.get('socialTwitter')    ?? '') || undefined,
    socialYoutube:    String(formData.get('socialYoutube')    ?? '') || undefined,
    hours,
  }

  const parsed = settingsUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updateSettings(ctxResult.ctx, parsed.data)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/settings?saved=1`)
}
