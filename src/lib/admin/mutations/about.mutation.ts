import { z } from 'zod'
import { rowToAboutContent } from '@/lib/persistence'
import type { AdminContext, MutationResult } from '@/lib/admin/context'
import type { AboutContent } from '@/types'

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const aboutUpdateSchema = z.object({
  story:        z.array(z.string().min(1)).min(1, 'La historia no puede estar vacía'),
  mission:      z.string().max(500).optional(),
  teamImageUrl: z.string().max(1000).optional(),
  differentiators: z.array(z.object({
    icon:        z.string().max(50).optional(),
    title:       z.string().min(1, 'El título es obligatorio').max(100),
    description: z.string().min(1, 'La descripción es obligatoria').max(500),
  })).optional(),
})

export type AboutUpdateInput = z.infer<typeof aboutUpdateSchema>

// ─── Update (Upsert) ──────────────────────────────────────────────────────────

export async function updateAbout(
  ctx: AdminContext,
  input: AboutUpdateInput,
): Promise<MutationResult<AboutContent>> {
  const { data, error } = await ctx.supabase
    .from('about')
    .upsert(
      {
        business_id:     ctx.businessId,
        story:           input.story,
        mission:         input.mission       ?? null,
        differentiators: input.differentiators ?? [],
        team_image_url:  input.teamImageUrl   || null,
      },
      { onConflict: 'business_id' },
    )
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo guardar el contenido. Por favor, intenta de nuevo.' }
  }

  return { ok: true, data: rowToAboutContent(data) }
}
