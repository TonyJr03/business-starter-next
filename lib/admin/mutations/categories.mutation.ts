import { z } from 'zod'
import { toSlug } from '@/lib/utils/slug'
import { rowToCategory } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { Category } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const categoryCreateSchema = z.object({
  name:        z.string().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().max(500).optional(),
  sortOrder:   z.coerce.number().int().min(0).default(0),
  isActive:    z.boolean().default(true),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createCategory(
  ctx: AdminContext,
  input: CategoryCreateInput,
): Promise<MutationResult<Category>> {
  // Obtener el catálogo por defecto del negocio
  const { data: catalog } = await ctx.supabase
    .from('catalog_pages')
    .select('id')
    .eq('business_id', ctx.businessId)
    .eq('is_active', true)
    .order('sort_order')
    .limit(1)
    .single()

  if (!catalog) {
    return { ok: false, error: 'No hay catálogos disponibles para este negocio.' }
  }

  const { data, error } = await ctx.supabase
    .from('catalog_categories')
    .insert({
      catalog_id:  catalog.id,
      slug:        toSlug(input.name),
      name:        input.name,
      description: input.description ?? null,
      sort_order:  input.sortOrder,
      is_active:   input.isActive,
    })
    .select()
    .single()

  if (error) {
    // 23505 = unique_violation → slug duplicado en el mismo catálogo
    if (error.code === '23505') {
      return { ok: false, error: 'Ya existe una categoría con ese nombre.', field: 'name' }
    }
    return { ok: false, error: 'No se pudo crear la categoría. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToCategory(data) }
}

// ─── Update ──────────────────────────────────────────────────────────────────

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
    .from('catalog_categories')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar la categoría. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Categoría no encontrada.' }

  return { ok: true, data: rowToCategory(data) }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteCategory(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('catalog_categories')
    .delete()
    .eq('id', id)

  if (error) {
    // 23503 = foreign_key_violation → tiene productos asociados
    if (error.code === '23503') {
      return { ok: false, error: 'No se puede eliminar: la categoría tiene productos asociados.' }
    }
    return { ok: false, error: 'No se pudo eliminar la categoría. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
