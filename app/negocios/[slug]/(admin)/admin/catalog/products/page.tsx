/**
 * /negocios/[slug]/admin/catalog/products — Listado de productos
 *
 * Server Component: carga productos con JOIN a categorías.
 * Feedback vía searchParams: ?created=1 | ?updated=1 | ?deleted=1
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader, AdminAlert, AdminEmptyState } from '@/components/admin'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string }>
}

export default async function ProductsListPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: rows, error: queryError } = await ctx.supabase
    .from('products')
    .select('id, slug, name, money_amount, money_currency, is_available, is_featured, badge, sort_order, categories(name)')
    .eq('business_id', ctx.businessId)
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })

  const products = rows ?? []

  const created = sp.created === '1'
  const updated = sp.updated === '1'
  const deleted = sp.deleted === '1'

  return (
    <div className="space-y-5">

      <AdminPageHeader
        title="Productos"
        description={`${products.length} ${products.length === 1 ? 'producto' : 'productos'}`}
        action={
          <Link
            href={`/negocios/${slug}/admin/catalog/products/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            + Nuevo producto
          </Link>
        }
      />

      {/* Feedback */}
      {created && <AdminAlert type="success" message="Producto creado correctamente." />}
      {updated && <AdminAlert type="success" message="Producto actualizado correctamente." />}
      {deleted && <AdminAlert type="neutral" message="Producto eliminado." />}
      {queryError && <AdminAlert type="error" message="No se pudieron cargar los productos. Por favor, recarga la página." />}

      {/* Tabla / Estado vacío */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {products.length === 0 ? (
          <AdminEmptyState
            title="No hay productos aún."
            description="Crea categorías primero y luego añade tus productos."
            action={
              <Link
                href={`/negocios/${slug}/admin/catalog/products/new`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
              >
                Crear primer producto
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden md:table-cell">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden lg:table-cell">Badge</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {products.map((p: {
                id: string
                slug: string
                name: string
                money_amount: number
                money_currency: string
                is_available: boolean
                is_featured: boolean
                badge: string | null
                sort_order: number
                categories: { name: string }[] | null
              }) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                    {p.is_featured && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20">
                        Destacado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                    {p.categories?.[0]?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 tabular-nums">
                    {Number(p.money_amount).toFixed(2)} {p.money_currency}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      p.is_available
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {p.is_available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 hidden lg:table-cell">
                    {p.badge ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/negocios/${slug}/admin/catalog/products/${p.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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
