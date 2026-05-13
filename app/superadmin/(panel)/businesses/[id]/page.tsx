import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { getBusinessById } from '@/services'
import { isSuperAdmin } from '@/lib/auth'
import { BusinessEditForm } from './BusinessEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; created?: string }>
}

export default async function SuperAdminBusinessPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp      = await searchParams

  const superAdmin = await isSuperAdmin()
  if (!superAdmin) notFound()

  const business = await getBusinessById(id)
  if (!business) notFound()

  return (
    <div className="space-y-6 max-w-xl">

      <AdminPageHeader
        title={business.name}
        description={`/${business.slug}`}
        action={
          <span className={[
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            business.isActive
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
          ].join(' ')}>
            {business.isActive ? 'Activo' : 'Inactivo'}
          </span>
        }
      />

      {sp.saved === '1' && (
        <AdminAlert type="success" message="Ajustes guardados correctamente." />
      )}
      {sp.created === '1' && (
        <AdminAlert type="success" message="Negocio creado correctamente. Ahora puedes completar sus datos." />
      )}

      {/* Formulario de datos básicos */}
      <BusinessEditForm businessId={id} businessSettings={business} />

      {/* Navegación a editores avanzados */}
      <div className="pt-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Configuración avanzada
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/superadmin/businesses/${id}/branding`}
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Branding</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Colores, logo y tipografía</span>
          </Link>
          <Link
            href={`/superadmin/businesses/${id}/modules`}
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Módulos</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Activar/desactivar funcionalidades</span>
          </Link>
        </div>
      </div>

    </div>
  )
}
