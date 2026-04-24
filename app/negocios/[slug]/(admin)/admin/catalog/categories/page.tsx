/**
 * /negocios/[slug]/admin/catalog/categories — Listado de categorías
 *
 * Server Component: carga datos desde DB, muestra tabla y feedback.
 * Feedback vía searchParams:
 *   ?created=1  → creada correctamente
 *   ?updated=1  → actualizada correctamente
 *   ?deleted=1  → eliminada
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string }>
}

export default async function CategoriesListPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: rows, error: queryError } = await ctx.supabase
    .from('categories')
    .select('id, slug, name, description, sort_order, is_active')
    .eq('business_id', ctx.businessId)
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })

  const categories = rows ?? []

  const created = sp.created === '1'
  const updated = sp.updated === '1'
  const deleted = sp.deleted === '1'

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Categorías</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
          </p>
        </div>
        <Link
          href={`/negocios/${slug}/admin/catalog/categories/new`}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
        >
          + Nueva categoría
        </Link>
      </div>

      {/* Feedback */}
      {created && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200" role="status">
          Categoría creada correctamente.
        </div>
      )}
      {updated && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200" role="status">
          Categoría actualizada correctamente.
        </div>
      )}
      {deleted && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200" role="status">
          Categoría eliminada.
        </div>
      )}
      {queryError && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200" role="alert">
          No se pudieron cargar las categorías. Por favor, recarga la página.
        </div>
      )}

      {/* Tabla / Estado vacío */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay categorías aún.</p>
            <Link
              href={`/negocios/${slug}/admin/catalog/categories/new`}
              className="mt-3 inline-block text-sm font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-2"
            >
              Crea la primera categoría
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 hidden md:table-cell">Orden</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {categories.map((cat: {
                id: string
                slug: string
                name: string
                description: string | null
                sort_order: number
                is_active: boolean
              }) => (
                <tr key={cat.id} className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      cat.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {cat.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">{cat.sort_order}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/negocios/${slug}/admin/catalog/categories/${cat.id}`}
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
