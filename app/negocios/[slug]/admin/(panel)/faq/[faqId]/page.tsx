import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { rowToFaqItem } from '@/lib/persistence'
import type { FaqItemRow } from '@/lib/persistence'
import { FaqEditForm } from './FaqEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; faqId: string }> }

export default async function EditFaqItemPage({ params }: Props) {
  const { slug, faqId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('faq')
    .select('id, question, answer, category, sort_order, is_active')
    .eq('id', faqId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!row) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/faq`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← FAQ
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Editar pregunta</h1>
      </div>
      <FaqEditForm slug={slug} item={rowToFaqItem(row as FaqItemRow)} />
    </div>
  )
}
