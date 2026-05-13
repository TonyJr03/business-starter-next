import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { rowToProduct } from '@/lib/persistence'
import type { ProductRow } from '@/lib/persistence'
import { ProductEditForm } from './ProductEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; catalogId: string; categoryId: string; productId: string }> }

export default async function EditProductPage({ params }: Props) {
  const { slug, catalogId, categoryId, productId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('catalog_products')
    .select('id, slug, name, description, money, is_available, is_featured, badge, sort_order, category_id')
    .eq('id', productId)
    .eq('category_id', categoryId)
    .single()

  if (!row) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${categoryId}/products`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Productos
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Editar producto</h1>
      </div>
      <ProductEditForm
        slug={slug}
        catalogId={catalogId}
        categoryId={categoryId}
        product={rowToProduct(row as ProductRow)}
      />
    </div>
  )
}
