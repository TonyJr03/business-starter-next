import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { rowToProduct } from '@/lib/persistence'
import type { ProductRow } from '@/lib/persistence'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; catalogId: string; categoryId: string }>, searchParams: Promise<{ created?: string; updated?: string; deleted?: string }> }

export default async function ProductsListPage({ params, searchParams }: Props) {
  const { slug, catalogId, categoryId } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: category } = await ctx.supabase
    .from('catalog_categories')
    .select('id, name, catalog_pages!inner(id, name, business_id)')
    .eq('id', categoryId)
    .eq('catalog_id', catalogId)
    .single()

  if (!category) notFound()

  const catalogName = (category.catalog_pages as unknown as { id: string; name: string; business_id: string } | null)?.name ?? ''

  const { data: rows, error: queryError } = await ctx.supabase
    .from('catalog_products')
    .select('id, slug, name, money, is_available, is_featured, badge, sort_order')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })

  const products = (rows ?? []).map(r => rowToProduct(r as ProductRow))

  return (
    <div className="space-y-5">

      <AdminPageHeader
        title={`Productos · ${category.name}`}
        description={`${products.length} ${products.length === 1 ? 'producto' : 'productos'}`}
        action={
          <Link
            href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${categoryId}/products/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            + Nuevo producto
          </Link>
        }
      />

      <div className="text-xs text-zinc-400 dark:text-zinc-500">
        <Link href={`/negocios/${slug}/admin/catalog`} className="hover:text-zinc-600 dark:hover:text-zinc-300">Catálogos</Link>
        {' › '}
        <Link href={`/negocios/${slug}/admin/catalog/${catalogId}`} className="hover:text-zinc-600 dark:hover:text-zinc-300">{catalogName}</Link>
        {' › '}
        <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories`} className="hover:text-zinc-600 dark:hover:text-zinc-300">Categorías</Link>
        {' › '}
        <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${categoryId}`} className="hover:text-zinc-600 dark:hover:text-zinc-300">{category.name}</Link>
        {' › Productos'}
      </div>

      {sp.created === '1' && <AdminAlert type="success" message="Producto creado correctamente." />}
      {sp.updated === '1' && <AdminAlert type="success" message="Producto actualizado correctamente." />}
      {sp.deleted === '1' && <AdminAlert type="neutral"  message="Producto eliminado." />}
      {queryError  && <AdminAlert type="error"   message="No se pudieron cargar los productos. Por favor, recarga la página." />}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {products.length === 0 ? (
          <AdminEmptyState
            title="No hay productos aún."
            description="Los productos aparecen en el catálogo público cuando están disponibles."
            action={
              <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${categoryId}/products/new`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                Agregar primer producto
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Disponible</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden md:table-cell">Destacado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{product.name}</div>
                    {product.badge && (
                      <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {product.badge}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 hidden sm:table-cell">
                    {product.money.amount.toFixed(2)} {product.money.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      product.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {product.isAvailable ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {product.isFeatured ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">⭐ Destacado</span>
                    ) : (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${categoryId}/products/${product.id}`}
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
