import Link from 'next/link'
import { CategoryNewForm } from './CategoryNewForm'

interface Props { params: Promise<{ slug: string; catalogId: string }> }

export default async function NewCategoryPage({ params }: Props) {
  const { slug, catalogId } = await params
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Categorías
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Nueva categoría</h1>
      </div>
      <CategoryNewForm slug={slug} catalogId={catalogId} />
    </div>
  )
}
