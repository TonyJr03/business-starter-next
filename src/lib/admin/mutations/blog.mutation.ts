import { z } from 'zod'
import { toSlug } from '@/lib/utils/slug'
import { rowToBlogPost } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { BlogPost } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const blogPostCreateSchema = z.object({
  title:       z.string().min(1, 'El título es obligatorio').max(300),
  summary:     z.string().min(1, 'El resumen es obligatorio').max(500),
  body:        z.array(z.string().min(1)).min(1, 'El contenido no puede estar vacío'),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
  author:      z.string().max(100).optional(),
  tags:        z.array(z.string()).optional(),
  isPublished: z.boolean().default(true),
})

export const blogPostUpdateSchema = blogPostCreateSchema.partial()

export type BlogPostCreateInput = z.infer<typeof blogPostCreateSchema>
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createPost(
  ctx: AdminContext,
  input: BlogPostCreateInput,
): Promise<MutationResult<BlogPost>> {
  const { data, error } = await ctx.supabase
    .from('blog')
    .insert({
      business_id:  ctx.businessId,
      slug:         toSlug(input.title),
      title:        input.title,
      summary:      input.summary,
      body:         input.body,
      published_at: input.publishedAt,
      author:       input.author  ?? null,
      tags:         input.tags    ?? [],
      is_published: input.isPublished,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Ya existe un artículo con ese título.', field: 'title' }
    }
    return { ok: false, error: 'No se pudo crear el artículo. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToBlogPost(data) }
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updatePost(
  ctx: AdminContext,
  id: string,
  input: BlogPostUpdateInput,
): Promise<MutationResult<BlogPost>> {
  const patch: Record<string, unknown> = {}
  if (input.title       !== undefined) patch.title        = input.title
  if (input.summary     !== undefined) patch.summary      = input.summary
  if (input.body        !== undefined) patch.body         = input.body
  if (input.publishedAt !== undefined) patch.published_at = input.publishedAt
  if (input.author      !== undefined) patch.author       = input.author ?? null
  if (input.tags        !== undefined) patch.tags         = input.tags   ?? []
  if (input.isPublished !== undefined) patch.is_published = input.isPublished

  const { data, error } = await ctx.supabase
    .from('blog')
    .update(patch)
    .eq('id', id)
    .eq('business_id', ctx.businessId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo actualizar el artículo. Por favor, intenta de nuevo.' }
  }
  if (!data) return { ok: false, error: 'Artículo no encontrado.' }

  return { ok: true, data: rowToBlogPost(data) }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deletePost(
  ctx: AdminContext,
  id: string,
): Promise<MutationResult<void>> {
  const { error } = await ctx.supabase
    .from('blog')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.businessId)

  if (error) {
    return { ok: false, error: 'No se pudo eliminar el artículo. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: undefined }
}
