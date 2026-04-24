import { z } from 'zod'
import { toSlug } from '@/lib/utils/slug'
import { rowToProduct } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { Product } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const productCreateSchema = z.object({
  name:          z.string().min(1, 'El nombre es obligatorio').max(200),
  description:   z.string().max(1000).optional(),
  categoryId:    z.string().uuid('Selecciona una categoría válida'),
  moneyAmount:   z.coerce.number().min(0, 'El precio no puede ser negativo'),
  moneyCurrency: z.string().length(3).default('CUP'),
  isAvailable:   z.boolean().default(true),
  isFeatured:    z.boolean().default(false),
  badge:         z.enum(['new', 'popular', 'offer']).optional(),
  sortOrder:     z.coerce.number().int().min(0).default(0),
})

/**
 * Todos los campos opcionales para actualizaciones parciales.
 */
export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

// ─── Mutaciones ───────────────────────────────────────────────────────────────

/**
 * Crea un producto nuevo para el negocio del contexto.
 * El slug se genera automáticamente desde el nombre.
 * image_url y tags quedan en null hasta que se implemente subida de archivos.
 *
 * Validación:
 *   - Verifica que la categoría existe y pertenece al negocio (RLS en DB).
 *   - Rechaza si el slug ya existe en el negocio.
 */
export async function createProduct(
  ctx: AdminContext,
  input: ProductCreateInput,
): Promise<MutationResult<Product>> {
  // Validar que la categoría existe y pertenece al negocio
  const { data: category } = await ctx.supabase
    .from('categories')
    .select('id')
    .eq('id', input.categoryId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!category) {
    return { ok: false, error: 'La categoría seleccionada no existe.', field: 'categoryId' }
  }

  const { data, error } = await ctx.supabase
    .from('products')
    .insert({
      business_id:    ctx.businessId,
      category_id:    input.categoryId,
      slug:           toSlug(input.name),
      name:           input.name,
      description:    input.description ?? null,
      money_amount:   input.moneyAmount,
      money_currency: input.moneyCurrency,
      is_available:   input.isAvailable,
      is_featured:    input.isFeatured,
      badge:          input.badge ?? null,
      tags:           null,
      image_url:      null,
      sort_order:     input.sortOrder,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Ya existe un producto con ese nombre.', field: 'name' }
    }
    return { ok: false, error: 'No se pudo crear el producto. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToProduct(data) }
}

/**
 * Actualiza los campos indicados de un producto existente.
 * El slug NO se modifica en actualizaciones para preservar URLs.
 *
 * RLS: el .eq('business_id', ctx.businessId) garantiza que solo se actualiza
 * si el producto pertenece al negocio autenticado.
 */
export async function updateProduct(
  ctx: AdminContext,
  id: string,
  input: ProductUpdateInput,
): Promise<MutationResult<Product>> {
  // Si cambia la categoría, verificar que pertenece al mismo negocio
  if (input.categoryId !== undefined) {
    const { data: category } = await ctx.supabase
      .from('categories')
      .select('id')
      .eq('id', input.categoryId)
      .eq('business_id', ctx.businessId)
      .single()

    if (!category) {
      return { ok: false, error: 'La categoría seleccionada no existe.', field: 'categoryId' }
    }
  }

  const patch: Record<string, unknown> = {}
  if (input.name          !== undefined) patch.name           = input.name
  if (input.description   !== undefined) patch.description    = input.description
  if (input.categoryId    !== undefined) patch.category_id    = input.categoryId
  if (input.moneyAmount   !== undefined) patch.money_amount   = input.moneyAmount
  if (input.moneyCurrency !== undefined) patch.money_currency = input.moneyCurrency
  if (input.isAvailable   !== undefined) patch.is_available   = input.isAvailable
  if (input.isFeatured    !== undefined) patch.is_featured    = input.isFeatured
  if (input.badge         !== undefined) patch.badge          = input.badge ?? null
  if (input.sortOrder     !== undefined) patch.sort_order     = input.sortOrder

  const { data, error } = await ctx.supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .eq('business_id', ctx.businessId) // RLS: solo el negocio propietario
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar el producto. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Producto no encontrado.' }

  return { ok: true, data: rowToProduct(data) }
}

/**
 * Elimina un producto.
 *
 * RLS: el .eq('business_id', ctx.businessId) garantiza que solo se elimina
 * si el producto pertenece al negocio autenticado.
 */
export async function deleteProduct(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) {
    return { ok: false, error: 'No se pudo eliminar el producto. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
