/**
 * /negocios/[slug]/admin/promotions — Listado de promociones
 *
 * Server Component.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'

interface Props {
  params:      Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

const STATUS_LABEL: Record<string, string> = {
  active:   'Activa',
  upcoming: 'Próxima',
  paused:   'Pausada',
  expired:  'Expirada',
}

const STATUS_COLOR: Record<string, string> = {
  active:   'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  paused:   'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  expired:  'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function PromotionsPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: rows } = await ctx.supabase
    .from('promotions')
    .select('id, title, status, discount_label, starts_at, ends_at, sort_order')
    .eq('business_id', ctx.businessId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const promotions = (rows ?? []) as {
    id: string
    title: string
    status: string
    discount_label: string | null
    starts_at: string | null
    ends_at: string | null
    sort_order: number
  }[]

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Promociones</h1>
        <Link
          href={`/negocios/${slug}/admin/promotions/new`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
        >
          + Nueva promoción
        </Link>
      </div>

      {/* Feedback flash */}
      {sp.created && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          Promoción creada correctamente.
        </div>
      )}
      {sp.updated && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          Promoción actualizada correctamente.
        </div>
      )}
      {sp.deleted && (
        <div className="rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
          Promoción eliminada.
        </div>
      )}

      {/* Estado vacío */}
      {promotions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
            No hay promociones todavía.
          </p>
          <Link
            href={`/negocios/${slug}/admin/promotions/new`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
          >
            Crear primera promoción
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Título</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Descuento</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Vigencia</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {promotions.map((p) => (
                <tr key={p.id} className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[p.status] ?? STATUS_COLOR.expired}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                    {p.discount_label ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden lg:table-cell text-xs">
                    {formatDate(p.starts_at)} → {formatDate(p.ends_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/negocios/${slug}/admin/promotions/${p.id}`}
                      className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
