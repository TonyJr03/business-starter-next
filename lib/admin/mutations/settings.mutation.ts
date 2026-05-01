import { z } from 'zod'
import { rowToBusinessSettings } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { BusinessSettings, DayHours } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const settingsUpdateSchema = z.object({
  name:             z.string().min(1, 'El nombre es obligatorio').max(200),
  shortDescription: z.string().max(300).optional(),
  whatsapp:         z.string().max(30).optional(),
  phone:            z.string().max(30).optional(),
  email:            z.union([z.string().email('Email inválido'), z.literal('')]).optional(),
  address:          z.string().max(300).optional(),
  city:             z.string().max(100).optional(),
  country:          z.string().max(100).optional(),
  socialInstagram:  z.string().max(200).optional(),
  socialFacebook:   z.string().max(200).optional(),
  socialTelegram:   z.string().max(200).optional(),
  socialTwitter:    z.string().max(200).optional(),
  socialYoutube:    z.string().max(200).optional(),
  hours: z.array(z.object({
    day:      z.string(),
    open:     z.string(),
    close:    z.string(),
    isClosed: z.boolean(),
  })).optional(),
})

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateSettings(
  ctx: AdminContext,
  input: SettingsUpdateInput,
): Promise<MutationResult<BusinessSettings>> {
  // Ensambla el objeto social solo con los campos que tienen valor
  const social: Record<string, string> = {}
  if (input.socialInstagram) social.instagram = input.socialInstagram
  if (input.socialFacebook)  social.facebook  = input.socialFacebook
  if (input.socialTelegram)  social.telegram  = input.socialTelegram
  if (input.socialTwitter)   social.twitter   = input.socialTwitter
  if (input.socialYoutube)   social.youtube   = input.socialYoutube

  const { data, error } = await ctx.supabase
    .from('businesses')
    .update({
      name:              input.name,
      short_description: input.shortDescription ?? null,
      whatsapp:          input.whatsapp   ?? null,
      phone:             input.phone      ?? null,
      email:             input.email      || null,
      address:           input.address    ?? null,
      city:              input.city       ?? null,
      country:           input.country    ?? null,
      social:            Object.keys(social).length > 0 ? social : null,
      ...(input.hours !== undefined && { hours: input.hours as unknown as DayHours[] }),
    })
    .eq('id', ctx.businessId) // RLS: solo el negocio autenticado
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudieron guardar los ajustes. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Negocio no encontrado.' }

  return { ok: true, data: rowToBusinessSettings(data) }
}
