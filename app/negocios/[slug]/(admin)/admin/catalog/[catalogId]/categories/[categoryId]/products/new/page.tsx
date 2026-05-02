import Link from 'next/link'
import { ProductNewForm } from './ProductNewForm'

interface Props { params: Promise<{ slug: string; catalogId: string; categoryId: string }> }

export default async function NewProductPage({ params }: Props) {
  const { slug, catalogId, categoryId } = await params
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${categoryId}/products`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Productos
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Nuevo producto</h1>
      </div>
      <ProductNewForm slug={slug} catalogId={catalogId} categoryId={categoryId} />
    </div>
  )
}
