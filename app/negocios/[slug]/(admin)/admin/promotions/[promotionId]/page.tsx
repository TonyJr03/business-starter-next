import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { PromotionEditForm } from './PromotionEditForm'

interface Props {
  params: Promise<{ slug: string; promotionId: string }>
}

/** Convierte un TIMESTAMPTZ de Supabase al formato datetime-local (YYYY-MM-DDTHH:mm) */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default async function EditPromotionPage({ params }: Props) {
  const { slug, promotionId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('promotions')
    .select('id, title, description, status, discount_label, starts_at, ends_at, rules, sort_order')
    .eq('id', promotionId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!row) notFound()

  const firstRule = Array.isArray(row.rules) && row.rules.length > 0 ? row.rules[0] : null

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/promotions`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Promociones
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Editar promoción</h1>
      </div>

      <PromotionEditForm
        slug={slug}
        promotion={{
          id:              row.id,
          title:           row.title,
          description:     row.description ?? '',
          status:          row.status,
          discountLabel:   row.discount_label ?? '',
          startsAt:        toDatetimeLocal(row.starts_at),
          endsAt:          toDatetimeLocal(row.ends_at),
          sortOrder:       row.sort_order,
          ruleType:        firstRule?.type        ?? '',
          ruleValue:       firstRule?.value       ?? '',
          ruleDescription: firstRule?.description ?? '',
        }}
      />
    </div>
  )
}
