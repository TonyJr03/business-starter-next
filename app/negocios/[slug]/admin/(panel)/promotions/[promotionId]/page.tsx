import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { rowToPromotion } from '@/lib/persistence'
import type { PromotionRow } from '@/lib/persistence'
import { PromotionEditForm } from './PromotionEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; promotionId: string }> }

export default async function EditPromotionPage({ params }: Props) {
  const { slug, promotionId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('promotions')
    .select('id, title, description, status, discount_label, starts_at, ends_at, rules, sort_order, business_id, image_url, created_at, updated_at')
    .eq('id', promotionId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!row) notFound()

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
        promotion={rowToPromotion(row as PromotionRow)}
      />
    </div>
  )
}
