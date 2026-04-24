/**
 * /negocios/[slug]/admin/catalog/products — Listado de productos
 *
 * Server Component: carga productos con JOIN a categorías.
 * Feedback vía searchParams: ?created=1 | ?updated=1 | ?deleted=1
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'

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
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Productos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <Link
          href={`/negocios/${slug}/admin/catalog/products/new`}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Feedback */}
      {created && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200" role="status">
          Producto creado correctamente.
        </div>
      )}
      {updated && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200" role="status">
          Producto actualizado correctamente.
        </div>
      )}
      {deleted && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200" role="status">
          Producto eliminado.
        </div>
      )}
      {queryError && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200" role="alert">
          Error al cargar los productos: {queryError.message}
        </div>
      )}

      {/* Tabla / Estado vacío */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay productos aún.</p>
            <Link
              href={`/negocios/${slug}/admin/catalog/products/new`}
              className="mt-3 inline-block text-sm font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-2"
            >
              Crea el primer producto
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 hidden md:table-cell">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">Badge</th>
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
                <tr key={p.id} className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                    {p.is_featured && (
                      <span className="ml-2 inline-flex px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        Destacado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                    {p.categories?.[0]?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {Number(p.money_amount).toFixed(2)} {p.money_currency}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.is_available
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {p.is_available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">
                    {p.badge ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/negocios/${slug}/admin/catalog/products/${p.id}`}
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2"
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
