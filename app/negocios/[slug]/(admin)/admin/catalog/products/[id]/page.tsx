/**
 * /negocios/[slug]/admin/catalog/products/[id] — Editar/eliminar producto
 *
 * Server Component: carga producto + categorías activas y los pasa al formulario cliente.
 * Si el id no pertenece al negocio autenticado → 404.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { ProductEditForm } from './ProductEditForm'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { slug, id } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const [{ data: prodRow }, { data: catRows }] = await Promise.all([
    ctx.supabase
      .from('products')
      .select('id, slug, name, description, category_id, money_amount, money_currency, is_available, is_featured, badge, sort_order')
      .eq('id', id)
      .eq('business_id', ctx.businessId) // RLS: solo el negocio propietario
      .single(),
    ctx.supabase
      .from('categories')
      .select('id, name')
      .eq('business_id', ctx.businessId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name',       { ascending: true }),
  ])

  if (!prodRow) notFound()

  const categories = (catRows ?? []) as { id: string; name: string }[]

  return (
    <div className="space-y-6 max-w-xl">

      <div>
        <Link
          href={`/negocios/${slug}/admin/catalog/products`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4"
        >
          ← Productos
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Editar producto
        </h1>
      </div>

      <ProductEditForm
        slug={slug}
        categories={categories}
        product={{
          id:            prodRow.id,
          slug:          prodRow.slug,
          name:          prodRow.name,
          description:   prodRow.description ?? '',
          categoryId:    prodRow.category_id,
          moneyAmount:   Number(prodRow.money_amount),
          moneyCurrency: prodRow.money_currency,
          isAvailable:   prodRow.is_available,
          isFeatured:    prodRow.is_featured,
          badge:         prodRow.badge ?? '',
          sortOrder:     prodRow.sort_order,
        }}
      />

    </div>
  )
}
