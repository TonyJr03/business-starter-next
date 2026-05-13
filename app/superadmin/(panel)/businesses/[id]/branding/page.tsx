import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { getBusinessById } from '@/services'
import { isSuperAdmin } from '@/lib/auth'
import { platformDefaults } from '@/config/platform-defaults'
import { BrandingEditor } from './BrandingEditor'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function SuperAdminBrandingPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams

  const superAdmin = await isSuperAdmin()
  if (!superAdmin) notFound()

  const business = await getBusinessById(id)
  if (!business) notFound()

  const override = business.branding
  const base = platformDefaults.branding

  // Valores efectivos para inicializar el editor
  const resolved = {
    themeKey: override?.themeKey ?? base.themeKey,
    colors: { ...base.colors, ...override?.colors },
    typography: { ...base.typography, ...override?.typography },
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <AdminPageHeader
        title={`Branding — ${business.name}`}
        description="Colores y tipografía del negocio."
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
        <AdminAlert type="success" message="Branding guardado correctamente." />
      )}

      <BrandingEditor
        businessId={id}
        resolved={resolved}
        override={override}
      />
    </div>
  )
}
