import { z } from 'zod'
import { toSlug } from '@/lib/utils/slug'
import { rowToCategory } from '@/lib/persistence/category'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { Category } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const categoryCreateSchema = z.object({
  name:        z.string().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().max(500).optional(),
  sortOrder:   z.coerce.number().int().min(0).default(0),
  isActive:    z.boolean().default(true),
})

/**
 * Todos los campos opcionales para actualizaciones parciales.
 * Solo parchea los campos presentes en el input.
 */
export const categoryUpdateSchema = categoryCreateSchema.partial()

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>

// ─── Mutaciones ───────────────────────────────────────────────────────────────

/**
 * Crea una categoría nueva para el negocio del contexto.
 * El slug se genera automáticamente desde el nombre.
 */
export async function createCategory(
  ctx: AdminContext,
  input: CategoryCreateInput,
): Promise<MutationResult<Category>> {
  const { data, error } = await ctx.supabase
    .from('categories')
    .insert({
      business_id: ctx.businessId,
      slug:        toSlug(input.name),
      name:        input.name,
      description: input.description ?? null,
      image_url:   null,
      sort_order:  input.sortOrder,
      is_active:   input.isActive,
    })
    .select()
    .single()

  if (error) {
    // 23505 = unique_violation → slug duplicado en el mismo negocio
    if (error.code === '23505') {
      return { ok: false, error: 'Ya existe una categoría con ese nombre.', field: 'name' }
    }
    return { ok: false, error: 'No se pudo crear la categoría. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToCategory(data) }
}

/**
 * Actualiza los campos indicados de una categoría existente.
 * El slug NO se modifica en actualizaciones para preservar URLs.
 *
 * RLS: el .eq('business_id', ctx.businessId) garantiza que solo se actualiza
 * si la categoría pertenece al negocio autenticado.
 */
export async function updateCategory(
  ctx: AdminContext,
  id: string,
  input: CategoryUpdateInput,
): Promise<MutationResult<Category>> {
  const patch: Record<string, unknown> = {}
  if (input.name        !== undefined) patch.name        = input.name
  if (input.description !== undefined) patch.description = input.description
  if (input.sortOrder   !== undefined) patch.sort_order  = input.sortOrder
  if (input.isActive    !== undefined) patch.is_active   = input.isActive

  const { data, error } = await ctx.supabase
    .from('categories')
    .update(patch)
    .eq('id', id)
    .eq('business_id', ctx.businessId) // RLS: solo el negocio propietario
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar la categoría. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Categoría no encontrada.' }

  return { ok: true, data: rowToCategory(data) }
}

/**
 * Elimina una categoría.
 * Falla con mensaje claro si tiene productos asociados (FK RESTRICT en DB).
 *
 * RLS: el .eq('business_id', ctx.businessId) garantiza que solo se elimina
 * si la categoría pertenece al negocio autenticado.
 */
export async function deleteCategory(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) {
    // 23503 = foreign_key_violation → tiene productos asociados
    if (error.code === '23503') {
      return { ok: false, error: 'No se puede eliminar: la categoría tiene productos asociados.' }
    }
    return { ok: false, error: 'No se pudo eliminar la categoría. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
