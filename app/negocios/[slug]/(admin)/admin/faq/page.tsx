import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface Props { params: Promise<{ slug: string }>, searchParams: Promise<{ created?: string; updated?: string; deleted?: string }> }

export default async function FaqListPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: rows, error: queryError } = await ctx.supabase
    .from('faq')
    .select('id, question, answer, category, sort_order, is_active')
    .eq('business_id', ctx.businessId)
    .order('sort_order', { ascending: true })
    .order('question',   { ascending: true })

  const items = rows ?? []

  return (
    <div className="space-y-5">

      <AdminPageHeader
        title="FAQ"
        description={`${items.length} ${items.length === 1 ? 'pregunta' : 'preguntas'}`}
        action={
          <Link href={`/negocios/${slug}/admin/faq/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
            + Nueva pregunta
          </Link>
        }
      />

      {sp.created === '1' && <AdminAlert type="success" message="Pregunta creada correctamente." />}
      {sp.updated === '1' && <AdminAlert type="success" message="Pregunta actualizada correctamente." />}
      {sp.deleted === '1' && <AdminAlert type="neutral"  message="Pregunta eliminada." />}
      {queryError  && <AdminAlert type="error"   message="No se pudieron cargar las preguntas. Por favor, recarga la página." />}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {items.length === 0 ? (
          <AdminEmptyState
            title="No hay preguntas frecuentes aún."
            description="Agrega las preguntas más comunes de tus clientes."
            action={
              <Link href={`/negocios/${slug}/admin/faq/new`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                Crear primera pregunta
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Pregunta</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item: {
                id: string; question: string; answer: string
                category: string | null; sort_order: number; is_active: boolean
              }) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                    {item.question}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                    {item.category ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {item.category}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      item.is_active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {item.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/negocios/${slug}/admin/faq/${item.id}`}
                      className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
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
