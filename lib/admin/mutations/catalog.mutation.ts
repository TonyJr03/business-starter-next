import { z } from 'zod'
import { toSlug } from '@/lib/utils/slug'
import { rowToCatalog, rowToCategory, rowToProduct } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { Catalog, Category, Product } from '@/types'

// ─── Esquemas ────────────────────────────────────────────────────────────────

export const catalogPageCreateSchema = z.object({
  name:        z.string().min(1, 'El nombre es obligatorio').max(200),
  description: z.string().max(500).optional(),
  sortOrder:   z.coerce.number().int().min(0).default(0),
  isActive:    z.boolean().default(true),
})

export const catalogPageUpdateSchema = catalogPageCreateSchema.partial()

export type CatalogPageCreateInput = z.infer<typeof catalogPageCreateSchema>
export type CatalogPageUpdateInput = z.infer<typeof catalogPageUpdateSchema>

export const categoryCreateSchema = z.object({
  name:        z.string().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().max(500).optional(),
  sortOrder:   z.coerce.number().int().min(0).default(0),
  isActive:    z.boolean().default(true),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>

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

export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createCatalogPage(
  ctx: AdminContext,
  input: CatalogPageCreateInput,
): Promise<MutationResult<Catalog>> {
  const { data, error } = await ctx.supabase
    .from('catalog_pages')
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
      return { ok: false, error: 'Ya existe un catálogo con ese nombre.', field: 'name' }
    }
    return { ok: false, error: 'No se pudo crear el catálogo. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToCatalog(data) }
}

export async function createCategory(
  ctx: AdminContext,
  catalogId: string,
  input: CategoryCreateInput,
): Promise<MutationResult<Category>> {
  const { data, error } = await ctx.supabase
    .from('catalog_categories')
    .insert({
      catalog_id:  catalogId,
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
      return { ok: false, error: 'Ya existe una categoría con ese nombre.', field: 'name' }
    }
    return { ok: false, error: 'No se pudo crear la categoría. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToCategory(data) }
}

export async function createProduct(
  ctx: AdminContext,
  input: ProductCreateInput,
): Promise<MutationResult<Product>> {
  const { data: category } = await ctx.supabase
    .from('catalog_categories')
    .select('id, catalog_pages!inner(business_id)')
    .eq('id', input.categoryId)
    .eq('catalog_pages.business_id', ctx.businessId)
    .single()

  if (!category) {
    return { ok: false, error: 'La categoría seleccionada no existe.', field: 'categoryId' }
  }

  const { data, error } = await ctx.supabase
    .from('catalog_products')
    .insert({
      category_id:    input.categoryId,
      slug:           toSlug(input.name),
      name:           input.name,
      description:    input.description ?? null,
      money_amount:   input.moneyAmount,
      money_currency: input.moneyCurrency,
      is_available:   input.isAvailable,
      is_featured:    input.isFeatured,
      badge:          input.badge ?? null,
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

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateCatalogPage(
  ctx: AdminContext,
  id: string,
  input: CatalogPageUpdateInput,
): Promise<MutationResult<Catalog>> {
  const patch: Record<string, unknown> = {}
  if (input.name        !== undefined) patch.name        = input.name
  if (input.description !== undefined) patch.description = input.description
  if (input.sortOrder   !== undefined) patch.sort_order  = input.sortOrder
  if (input.isActive    !== undefined) patch.is_active   = input.isActive

  const { data, error } = await ctx.supabase
    .from('catalog_pages')
    .update(patch)
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar el catálogo. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Catálogo no encontrado.' }

  return { ok: true, data: rowToCatalog(data) }
}

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

export async function updateProduct(
  ctx: AdminContext,
  id: string,
  input: ProductUpdateInput,
): Promise<MutationResult<Product>> {
  if (input.categoryId !== undefined) {
    const { data: category } = await ctx.supabase
      .from('catalog_categories')
      .select('id, catalog_pages!inner(business_id)')
      .eq('id', input.categoryId)
      .eq('catalog_pages.business_id', ctx.businessId)
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
    .from('catalog_products')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar el producto. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Producto no encontrado.' }

  return { ok: true, data: rowToProduct(data) }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteCatalogPage(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('catalog_pages')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) {
    if (error.code === '23503') {
      return { ok: false, error: 'No se puede eliminar: el catálogo tiene categorías asociadas.' }
    }
    return { ok: false, error: 'No se pudo eliminar el catálogo. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}

export async function deleteCategory(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('catalog_categories')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return { ok: false, error: 'No se puede eliminar: la categoría tiene productos asociados.' }
    }
    return { ok: false, error: 'No se pudo eliminar la categoría. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}

export async function deleteProduct(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('catalog_products')
    .delete()
    .eq('id', id)

  if (error) {
    return { ok: false, error: 'No se pudo eliminar el producto. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
