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
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          ← Volver a promociones
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-3">
          Nueva promoción
        </h1>
      </div>

      <PromotionNewForm slug={slug} />
    </div>
  )
}
