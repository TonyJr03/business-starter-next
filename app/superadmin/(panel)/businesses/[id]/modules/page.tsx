import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getBusinessById } from '@/services'
import { isSuperAdmin } from '@/lib/auth'

interface Props { params: Promise<{ id: string }> }

export default async function SuperAdminModulesPage({ params }: Props) {
  const { id } = await params

  const superAdmin = await isSuperAdmin()
  if (!superAdmin) notFound()

  const business = await getBusinessById(id)
  if (!business) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <AdminPageHeader
        title={`Módulos — ${business.name}`}
        description="Activa o desactiva funcionalidades del negocio."
      />

      {/* TODO Step 8: ModulesEditor */}
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center text-zinc-400">
        <p className="text-sm">Editor de módulos — próximamente (Step 8)</p>
      </div>
    </div>
  )
}
