/**
 * /negocios/[slug]/admin/catalog/products/new — Crear producto
 *
 * Server Component: carga categorías activas y renderiza el formulario cliente.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { ProductNewForm } from './ProductNewForm'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function NewProductPage({ params }: Props) {
  const { slug } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: catRows } = await ctx.supabase
    .from('categories')
    .select('id, name')
    .eq('business_id', ctx.businessId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })

  const categories = (catRows ?? []) as { id: string; name: string }[]

  return (
    <div className="space-y-6 max-w-xl">

      <div>
        <Link
          href={`/negocios/${slug}/admin/catalog/products`}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-3">
          Nuevo producto
        </h1>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          No hay categorías activas.{' '}
          <Link
            href={`/negocios/${slug}/admin/catalog/categories/new`}
            className="font-medium underline underline-offset-2"
          >
            Crea una categoría primero
          </Link>.
        </div>
      ) : (
        <ProductNewForm slug={slug} categories={categories} />
      )}

    </div>
  )
}
