import Link from 'next/link'
import { notFound, forbidden } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { getBusinessById } from '@/services'
import { getSuperAdminContext } from '@/lib/admin'
import { resolveModules } from '@/lib/modules/resolver'
import { ModulesEditor } from './ModulesEditor'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function SuperAdminModulesPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams

  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) forbidden()

  const business = await getBusinessById(id)
  if (!business) notFound()

  const resolved = resolveModules(business)

  return (
    <div className="space-y-6 max-w-2xl">
      <AdminPageHeader
        title={`Módulos — ${business.name}`}
        description="Activa, desactiva y personaliza los módulos del negocio."
        action={
          <Link
            href={`/superadmin/businesses/${id}`}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ← Volver
          </Link>
        }
      />

      {sp.saved === '1' && (
        <AdminAlert type="success" message="Módulos guardados correctamente." />
      )}

      <ModulesEditor businessId={id} resolved={resolved} />
    </div>
  )
}
