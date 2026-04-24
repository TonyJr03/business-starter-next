/**
 * /negocios/[slug]/admin/catalog/categories/new — Crear categoría
 *
 * Server Component: renderiza el formulario cliente.
 */

import Link from 'next/link'
import { CategoryNewForm } from './CategoryNewForm'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function NewCategoryPage({ params }: Props) {
  const { slug } = await params

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
          Nueva categoría
        </h1>
      </div>

      <CategoryNewForm slug={slug} />

    </div>
  )
}
