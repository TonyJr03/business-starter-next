import { z } from 'zod'
import { rowToBusinessSettings } from '@/lib/persistence'
import type { AdminContext, MutationResult, SupabaseServerClient } from '@/lib/admin/context'
import type { BusinessSettings, DayHours } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

/** Campos de contacto/ubicación/social/horarios — compartidos por ambos schemas. */
const businessContactFields = {
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
}

/** Admin de tenant: solo contacto/ubicación/social/horarios. Sin nombre, slug ni isActive. */
export const businessAdminSchema = z.object(businessContactFields)

export type BusinessAdminInput = z.infer<typeof businessAdminSchema>

/** Superadmin: nombre + slug + isActive + todos los campos de contacto. */
export const businessSuperAdminSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  slug: z.string()
    .min(1, 'El slug es obligatorio')
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Solo minúsculas, números y guiones. Sin espacios ni caracteres especiales.',
    ),
  isActive: z.boolean().default(true),
  ...businessContactFields,
})

export type BusinessSuperAdminInput = z.infer<typeof businessSuperAdminSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildContactLocationSocial(input: BusinessAdminInput | BusinessSuperAdminInput) {
  const social: Record<string, string> = {}
  if (input.socialInstagram) social.instagram = input.socialInstagram
  if (input.socialFacebook)  social.facebook  = input.socialFacebook
  if (input.socialTelegram)  social.telegram  = input.socialTelegram
  if (input.socialTwitter)   social.twitter   = input.socialTwitter
  if (input.socialYoutube)   social.youtube   = input.socialYoutube

  const contact: Record<string, string> = {}
  if (input.whatsapp) contact.whatsapp = input.whatsapp
  if (input.phone)    contact.phone    = input.phone
  if (input.email)    contact.email    = input.email

  const location: Record<string, string> = {}
  if (input.address) location.address = input.address
  if (input.city)    location.city    = input.city
  if (input.country) location.country = input.country

  return { social, contact, location }
}

// ─── Update (admin de tenant) ────────────────────────────────────────────────

export async function updateBusiness(
  ctx: AdminContext,
  input: BusinessAdminInput,
): Promise<MutationResult<BusinessSettings>> {
  const { social, contact, location } = buildContactLocationSocial(input)

  const { data, error } = await ctx.supabase
    .from('businesses')
    .update({
      short_description: input.shortDescription ?? null,
      contact:           contact,
      location:          location,
      social:            Object.keys(social).length > 0 ? social : null,
      ...(input.hours !== undefined && { hours: input.hours as unknown as DayHours[] }),
    })
    .eq('id', ctx.businessId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudieron guardar los ajustes. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Negocio no encontrado.' }

  return { ok: true, data: rowToBusinessSettings(data) }
}

// ─── Create (superadmin) ─────────────────────────────────────────────────────

export async function createBusiness(
  supabase: SupabaseServerClient,
  input: BusinessSuperAdminInput,
): Promise<MutationResult<BusinessSettings>> {
  const { social, contact, location } = buildContactLocationSocial(input)

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      slug:              input.slug,
      name:              input.name,
      short_description: input.shortDescription ?? null,
      is_active:         input.isActive,
      contact:           contact,
      location:          location,
      social:            Object.keys(social).length > 0 ? social : {},
      ...(input.hours !== undefined && { hours: input.hours as unknown as DayHours[] }),
    })
    .select()
    .single()

  if (error) {
    console.error('[createBusiness] Supabase error:', error)
    if (error.code === '23505') {
      return { ok: false, error: 'El slug ya está en uso. Elige otro.', field: 'slug' }
    }
    return { ok: false, error: 'No se pudo crear el negocio. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToBusinessSettings(data) }
}

// ─── Update (superadmin) ─────────────────────────────────────────────────────

export async function updateBusinessById(
  supabase: SupabaseServerClient,
  businessId: string,
  input: BusinessSuperAdminInput,
): Promise<MutationResult<BusinessSettings>> {
  const { social, contact, location } = buildContactLocationSocial(input)

  const { data, error } = await supabase
    .from('businesses')
    .update({
      name:              input.name,
      slug:              input.slug,
      short_description: input.shortDescription ?? null,
      is_active:         input.isActive,
      contact:           contact,
      location:          location,
      social:            Object.keys(social).length > 0 ? social : {},
      ...(input.hours !== undefined && { hours: input.hours as unknown as DayHours[] }),
    })
    .eq('id', businessId)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'El slug ya está en uso. Elige otro.', field: 'slug' }
    }
    return { ok: false, error: 'No se pudieron guardar los ajustes. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Negocio no encontrado.' }

  return { ok: true, data: rowToBusinessSettings(data) }
}

// ─── Delete (superadmin) ─────────────────────────────────────────────────────

export async function deleteBusiness(
  supabase: SupabaseServerClient,
  businessId: string,
): Promise<MutationResult<void>> {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId)

  if (error) {
    return { ok: false, error: 'No se pudo eliminar el negocio. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
