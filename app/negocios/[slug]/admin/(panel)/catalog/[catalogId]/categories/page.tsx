import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { rowToCategory } from '@/lib/persistence'
import type { CategoryRow } from '@/lib/persistence'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; catalogId: string }>, searchParams: Promise<{ created?: string; updated?: string; deleted?: string }> }

export default async function CategoriesListPage({ params, searchParams }: Props) {
  const { slug, catalogId } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  // Verify catalog belongs to business
  const { data: catalog } = await ctx.supabase
    .from('catalog_pages')
    .select('id, name')
    .eq('id', catalogId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!catalog) notFound()

  const { data: rows, error: queryError } = await ctx.supabase
    .from('catalog_categories')
    .select('id, slug, name, description, sort_order, is_active')
    .eq('catalog_id', catalogId)
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })

  const categories = (rows ?? []).map(r => rowToCategory(r as CategoryRow))

  return (
    <div className="space-y-5">

      <AdminPageHeader
        title={`Categorías · ${catalog.name}`}
        description={`${categories.length} ${categories.length === 1 ? 'categoría' : 'categorías'}`}
        action={
          <Link
            href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            + Nueva categoría
          </Link>
        }
      />

      <div className="text-xs text-zinc-400 dark:text-zinc-500">
        <Link href={`/negocios/${slug}/admin/catalog`} className="hover:text-zinc-600 dark:hover:text-zinc-300">Catálogos</Link>
        {' › '}
        <Link href={`/negocios/${slug}/admin/catalog/${catalogId}`} className="hover:text-zinc-600 dark:hover:text-zinc-300">{catalog.name}</Link>
        {' › Categorías'}
      </div>

      {sp.created === '1' && <AdminAlert type="success" message="Categoría creada correctamente." />}
      {sp.updated === '1' && <AdminAlert type="success" message="Categoría actualizada correctamente." />}
      {sp.deleted === '1' && <AdminAlert type="neutral"  message="Categoría eliminada." />}
      {queryError  && <AdminAlert type="error"   message="No se pudieron cargar las categorías. Por favor, recarga la página." />}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {categories.length === 0 ? (
          <AdminEmptyState
            title="No hay categorías aún."
            description="Las categorías organizan los productos dentro del catálogo."
            action={
              <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/new`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                Crear primera categoría
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
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</td>
                  <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {cat.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">{cat.sortOrder}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${cat.id}/products`}
                      className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Productos
                    </Link>
                    <Link
                      href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${cat.id}`}
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
