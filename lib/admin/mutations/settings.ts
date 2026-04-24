import { z } from 'zod'
import { rowToBusinessSettings } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { BusinessSettings } from '@/lib/persistence'

// ─── Esquema de validación ────────────────────────────────────────────────────

/**
 * Campos editables desde el panel de ajustes del negocio.
 *
 * Excluidos deliberadamente:
 *   · hours  → gestión de horarios requiere UI más elaborada (M8+)
 *   · slug   → no editable desde admin (cambiaría URLs y referencias)
 *
 * Redes sociales: campos individuales que se componen en el objeto JSONB.
 */
export const settingsUpdateSchema = z.object({
  name:             z.string().min(1, 'El nombre es obligatorio').max(200),
  shortDescription: z.string().max(300).optional(),
  whatsapp:         z.string().max(30).optional(),
  phone:            z.string().max(30).optional(),
  // Email: acepta string vacío (campo vacío en formulario) o email válido
  email:            z.union([z.string().email('Email inválido'), z.literal('')]).optional(),
  address:          z.string().max(300).optional(),
  city:             z.string().max(100).optional(),
  country:          z.string().max(100).optional(),
  // Redes sociales como campos individuales (se ensamblan en JSONB)
  socialInstagram:  z.string().max(200).optional(),
  socialFacebook:   z.string().max(200).optional(),
  socialTelegram:   z.string().max(200).optional(),
  socialTwitter:    z.string().max(200).optional(),
  socialYoutube:    z.string().max(200).optional(),
})

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>

// ─── Mutación ─────────────────────────────────────────────────────────────────

/**
 * Actualiza los ajustes básicos del negocio.
 *
 * El objeto social se reemplaza completo: campos con valor se incluyen,
 * campos vacíos se excluyen. El campo `hours` NO se modifica.
 *
 * RLS: el .eq('id', ctx.businessId) garantiza que solo se actualiza
 * el negocio autenticado.
 */
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
