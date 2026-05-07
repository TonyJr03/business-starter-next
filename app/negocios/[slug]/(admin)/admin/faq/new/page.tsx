import Link from 'next/link'
import { FaqNewForm } from './FaqNewForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string }> }

export default async function NewFaqItemPage({ params }: Props) {
  const { slug } = await params
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/faq`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← FAQ
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Nueva pregunta</h1>
      </div>
      <FaqNewForm slug={slug} />
    </div>
  )
}
