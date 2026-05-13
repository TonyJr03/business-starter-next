import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getBusinessById } from '@/services'
import { isSuperAdmin } from '@/lib/auth'

interface Props { params: Promise<{ id: string }> }

export default async function SuperAdminBrandingPage({ params }: Props) {
  const { id } = await params

  const superAdmin = await isSuperAdmin()
  if (!superAdmin) notFound()

  const business = await getBusinessById(id)
  if (!business) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <AdminPageHeader
        title={`Branding — ${business.name}`}
        description="Colores, logo y tipografía del negocio."
      />

      {/* TODO Step 9: BrandingEditor */}
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center text-zinc-400">
        <p className="text-sm">Editor de branding — próximamente (Step 9)</p>
      </div>
    </div>
  )
}
