import { z } from 'zod'
import { toSlug } from '@/lib/utils/slug'
import { rowToGalleryAlbum, rowToGalleryPhoto } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { GalleryAlbum, GalleryPhoto } from '@/types'

// ─── Esquemas de validación ──────────────────────────────────────────────────

export const albumCreateSchema = z.object({
  name:        z.string().min(1, 'El nombre es obligatorio').max(200),
  description: z.string().max(500).optional(),
  sortOrder:   z.coerce.number().int().min(0).default(0),
  isActive:    z.boolean().default(true),
})

export const albumUpdateSchema = albumCreateSchema.partial()

export type AlbumCreateInput = z.infer<typeof albumCreateSchema>
export type AlbumUpdateInput = z.infer<typeof albumUpdateSchema>

export const photoCreateSchema = z.object({
  imageUrl:  z.string().min(1, 'La URL de la imagen es obligatoria').max(1000),
  alt:       z.string().min(1, 'El texto alternativo es obligatorio').max(200),
  caption:   z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive:  z.boolean().default(true),
})

export const photoUpdateSchema = photoCreateSchema.partial()

export type PhotoCreateInput = z.infer<typeof photoCreateSchema>
export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createAlbum(
  ctx: AdminContext,
  input: AlbumCreateInput,
): Promise<MutationResult<GalleryAlbum>> {
  const { data, error } = await ctx.supabase
    .from('gallery_albums')
    .insert({
      business_id: ctx.businessId,
      slug:        toSlug(input.name),
      name:        input.name,
      description: input.description ?? null,
      sort_order:  input.sortOrder,
      is_active:   input.isActive,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Ya existe un álbum con ese nombre.', field: 'name' }
    }
    return { ok: false, error: 'No se pudo crear el álbum. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToGalleryAlbum(data) }
}

export async function createPhoto(
  ctx: AdminContext,
  albumId: string,
  input: PhotoCreateInput,
): Promise<MutationResult<GalleryPhoto>> {
  const { data, error } = await ctx.supabase
    .from('gallery_photos')
    .insert({
      business_id: ctx.businessId,
      album_id:    albumId,
      image_url:   input.imageUrl,
      alt:         input.alt,
      caption:     input.caption   ?? null,
      sort_order:  input.sortOrder,
      is_active:   input.isActive,
    })
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo añadir la foto. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToGalleryPhoto(data) }
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateAlbum(
  ctx: AdminContext,
  id: string,
  input: AlbumUpdateInput,
): Promise<MutationResult<GalleryAlbum>> {
  const patch: Record<string, unknown> = {}
  if (input.name        !== undefined) patch.name        = input.name
  if (input.description !== undefined) patch.description = input.description
  if (input.sortOrder   !== undefined) patch.sort_order  = input.sortOrder
  if (input.isActive    !== undefined) patch.is_active   = input.isActive

  const { data, error } = await ctx.supabase
    .from('gallery_albums')
    .update(patch)
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar el álbum. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Álbum no encontrado.' }

  return { ok: true, data: rowToGalleryAlbum(data) }
}

export async function updatePhoto(
  ctx: AdminContext,
  id: string,
  input: PhotoUpdateInput,
): Promise<MutationResult<GalleryPhoto>> {
  const patch: Record<string, unknown> = {}
  if (input.imageUrl  !== undefined) patch.image_url  = input.imageUrl
  if (input.alt       !== undefined) patch.alt        = input.alt
  if (input.caption   !== undefined) patch.caption    = input.caption ?? null
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder
  if (input.isActive  !== undefined) patch.is_active  = input.isActive

  const { data, error } = await ctx.supabase
    .from('gallery_photos')
    .update(patch)
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar la foto. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Foto no encontrada.' }

  return { ok: true, data: rowToGalleryPhoto(data) }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteAlbum(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('gallery_albums')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) {
    if (error.code === '23503') {
      return { ok: false, error: 'No se puede eliminar: el álbum tiene fotos asociadas.' }
    }
    return { ok: false, error: 'No se pudo eliminar el álbum. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}

export async function deletePhoto(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('gallery_photos')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) {
    return { ok: false, error: 'No se pudo eliminar la foto. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
