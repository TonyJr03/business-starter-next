import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { rowToAboutContent } from '@/lib/persistence'
import type { AboutRow } from '@/lib/persistence'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { AboutEditForm } from './AboutEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string }>, searchParams: Promise<{ saved?: string }> }

export default async function AboutAdminPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('about')
    .select('*')
    .eq('business_id', ctx.businessId)
    .maybeSingle()

  const about = row ? rowToAboutContent(row as AboutRow) : null

  return (
    <div className="space-y-5 max-w-2xl">
      <AdminPageHeader
        title="Nosotros"
        description="Historia, misión y diferenciadores del negocio."
      />
      {sp.saved === '1' && <AdminAlert type="success" message="Cambios guardados correctamente." />}
      <AboutEditForm slug={slug} about={about} />
    </div>
  )
}
