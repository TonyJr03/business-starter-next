import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { rowToBusinessSettings } from '@/lib/persistence'
import type { BusinessSettingsRow } from '@/lib/persistence'
import { BusinessEditForm } from './BusinessEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string }>, searchParams: Promise<{ saved?: string }> }

export default async function BusinessPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('businesses')
    .select('id, slug, name, short_description, contact, location, logo, social, hours, is_active, branding, modules, created_at, updated_at')
    .eq('id', ctx.businessId)
    .single()

  if (!row) notFound()

  const settings = rowToBusinessSettings(row as BusinessSettingsRow)

  return (
    <div className="space-y-6 max-w-xl">

      <AdminPageHeader
        title="Ajustes del negocio"
        description="Información básica visible en el catálogo público."
      />

      {sp.saved === '1' && <AdminAlert type="success" message="Ajustes guardados correctamente." />}

      <BusinessEditForm
        slug={slug}
        businessSettings={settings}
      />

    </div>
  )
}
