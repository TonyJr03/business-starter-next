'use server'

import { redirect } from 'next/navigation'
import {
  getAdminContext,
  settingsUpdateSchema,
  updateSettings,
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

export async function updateSettingsAction(
  slug: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

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

  redirect(`/negocios/${slug}/admin/settings?saved=1`)
}
