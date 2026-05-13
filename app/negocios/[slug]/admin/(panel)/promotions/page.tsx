import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { rowToPromotion } from '@/lib/persistence'
import type { PromotionRow } from '@/lib/persistence'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  active:   'Activa',
  upcoming: 'Próxima',
  paused:   'Pausada',
  expired:  'Expirada',
}

const STATUS_COLOR: Record<string, string> = {
  active:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20',
  upcoming: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20',
  paused:   'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20',
  expired:  'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string }>, searchParams: Promise<{ created?: string; updated?: string; deleted?: string }> }

export default async function PromotionsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: rows, error: queryError } = await ctx.supabase
    .from('promotions')
    .select('id, title, status, discount_label, starts_at, ends_at, sort_order')
    .eq('business_id', ctx.businessId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const promotions = (rows ?? []).map(r => rowToPromotion(r as PromotionRow))

  return (
    <div className="space-y-5">

      <AdminPageHeader
        title="Promociones"
        description={`${promotions.length} ${promotions.length === 1 ? 'promoción' : 'promociones'}`}
        action={
          <Link
            href={`/negocios/${slug}/admin/promotions/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            + Nueva promoción
          </Link>
        }
      />

      {sp.created === '1' && <AdminAlert type="success" message="Promoción creada correctamente." />}
      {sp.updated === '1' && <AdminAlert type="success" message="Promoción actualizada correctamente." />}
      {sp.deleted === '1' && <AdminAlert type="neutral"  message="Promoción eliminada." />}
      {queryError  && <AdminAlert type="error"   message="No se pudieron cargar las promociones. Por favor, recarga la página." />}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {promotions.length === 0 ? (
          <AdminEmptyState
            title="No hay promociones todavía."
            description="Las promociones se muestran en el sitio público de tu negocio."
            action={
              <Link
                href={`/negocios/${slug}/admin/promotions/new`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
              >
                Crear primera promoción
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Título</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden md:table-cell">Descuento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden lg:table-cell">Vigencia</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLOR[p.status] ?? STATUS_COLOR.expired}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                    {p.discountLabel ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 hidden lg:table-cell text-xs tabular-nums">
                    {formatDate(p.startsAt)} → {formatDate(p.endsAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/negocios/${slug}/admin/promotions/${p.id}`}
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
