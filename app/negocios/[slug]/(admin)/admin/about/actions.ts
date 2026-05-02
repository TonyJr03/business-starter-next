'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { 
  getAdminContext, 
  aboutUpdateSchema, 
  updateAbout   
} from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateAboutAction(
  slug: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const story = String(formData.get('story') ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const differentiators: { icon?: string; title: string; description: string }[] = []
  for (let i = 0; i < 5; i++) {
    const title = String(formData.get(`diff_title_${i}`) ?? '').trim()
    if (!title) continue
    differentiators.push({
      icon:        String(formData.get(`diff_icon_${i}`)  ?? '').trim() || undefined,
      title,
      description: String(formData.get(`diff_desc_${i}`)  ?? '').trim(),
    })
  }

  const raw = {
    story,
    mission:      String(formData.get('mission')      ?? '').trim() || undefined,
    teamImageUrl: String(formData.get('teamImageUrl') ?? '').trim() || undefined,
    differentiators: differentiators.length > 0 ? differentiators : undefined,
  }

  const parsed = aboutUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstField = Object.keys(errors)[0] as string
    return {
      ok: false,
      error: (errors[firstField as keyof typeof errors] ?? ['Datos inválidos.'])[0]!,
      field: firstField,
    }
  }

  const result = await updateAbout(ctxResult.ctx, parsed.data)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/negocios/${slug}`, 'layout')
  redirect(`/negocios/${slug}/admin/about?saved=1`)
}
