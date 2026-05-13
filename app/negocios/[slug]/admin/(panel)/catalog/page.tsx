import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { rowToCatalog } from '@/lib/persistence'
import type { CatalogRow } from '@/lib/persistence'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string }>, searchParams: Promise<{ created?: string; updated?: string; deleted?: string }> }

export default async function CatalogListPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: rows, error: queryError } = await ctx.supabase
    .from('catalog_pages')
    .select('id, slug, name, description, sort_order, is_active')
    .eq('business_id', ctx.businessId)
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })

  const catalogs = (rows ?? []).map(r => rowToCatalog(r as CatalogRow))

  return (
    <div className="space-y-5">

      <AdminPageHeader
        title="Catálogos"
        description={`${catalogs.length} ${catalogs.length === 1 ? 'catálogo' : 'catálogos'}`}
        action={
          <Link
            href={`/negocios/${slug}/admin/catalog/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            + Nuevo catálogo
          </Link>
        }
      />

      {sp.created === '1' && <AdminAlert type="success" message="Catálogo creado correctamente." />}
      {sp.updated === '1' && <AdminAlert type="success" message="Catálogo actualizado correctamente." />}
      {sp.deleted === '1' && <AdminAlert type="neutral"  message="Catálogo eliminado." />}
      {queryError  && <AdminAlert type="error"   message="No se pudieron cargar los catálogos. Por favor, recarga la página." />}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {catalogs.length === 0 ? (
          <AdminEmptyState
            title="No hay catálogos aún."
            description="Los catálogos agrupan las categorías y productos de tu negocio."
            action={
              <Link
                href={`/negocios/${slug}/admin/catalog/new`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
              >
                Crear primer catálogo
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden md:table-cell">Orden</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {catalogs.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</td>
                  <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {cat.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">{cat.sortOrder}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/negocios/${slug}/admin/catalog/${cat.id}/categories`}
                      className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Categorías
                    </Link>
                    <Link
                      href={`/negocios/${slug}/admin/catalog/${cat.id}`}
                      className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
