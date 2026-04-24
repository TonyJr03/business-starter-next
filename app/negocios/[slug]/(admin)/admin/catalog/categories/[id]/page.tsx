/**
 * /negocios/[slug]/admin/catalog/categories/[id] — Editar/eliminar categoría
 *
 * Server Component: carga la categoría desde DB y renderiza el formulario cliente.
 * Si el id no pertenece al negocio autenticado → 404.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { CategoryEditForm } from './CategoryEditForm'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const { slug, id } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: catRow } = await ctx.supabase
    .from('categories')
    .select('id, slug, name, description, sort_order, is_active')
    .eq('id', id)
    .eq('business_id', ctx.businessId) // RLS: solo el negocio propietario
    .single()

  if (!catRow) notFound()

  return (
    <div className="space-y-6 max-w-xl">

      <div>
        <Link
          href={`/negocios/${slug}/admin/catalog/categories`}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          ← Volver a categorías
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-3">
          Editar categoría
        </h1>
      </div>

      <CategoryEditForm
        slug={slug}
        category={{
          id:          catRow.id,
          slug:        catRow.slug,
          name:        catRow.name,
          description: catRow.description ?? '',
          sortOrder:   catRow.sort_order,
          isActive:    catRow.is_active,
        }}
      />

    </div>
  )
}
