/**
 * /negocios/[slug]/admin/promotions/new — Crear promoción
 *
 * Server Component.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { PromotionNewForm } from './PromotionNewForm'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function NewPromotionPage({ params }: Props) {
  const { slug } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link
          href={`/negocios/${slug}/admin/promotions`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4"
        >
          ← Promociones
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Nueva promoción
        </h1>
      </div>

      <PromotionNewForm slug={slug} />
    </div>
  )
}
