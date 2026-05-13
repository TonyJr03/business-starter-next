import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { rowToCategory } from '@/lib/persistence'
import type { CategoryRow } from '@/lib/persistence'
import { CategoryEditForm } from './CategoryEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; catalogId: string; categoryId: string }> }

export default async function EditCategoryPage({ params }: Props) {
  const { slug, catalogId, categoryId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('catalog_categories')
    .select('id, slug, name, description, sort_order, is_active')
    .eq('id', categoryId)
    .eq('catalog_id', catalogId)
    .single()

  if (!row) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Categorías
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Editar categoría</h1>
          <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${categoryId}/products`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Ver productos →
          </Link>
        </div>
      </div>
      <CategoryEditForm slug={slug} catalogId={catalogId} category={rowToCategory(row as CategoryRow)} />
    </div>
  )
}
