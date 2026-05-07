import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { rowToCatalog } from '@/lib/persistence'
import type { CatalogRow } from '@/lib/persistence'
import { CatalogPageEditForm } from './CatalogPageEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; catalogId: string }> }

export default async function EditCatalogPage({ params }: Props) {
  const { slug, catalogId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('catalog_pages')
    .select('id, slug, name, description, sort_order, is_active')
    .eq('id', catalogId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!row) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/catalog`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Catálogos
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Editar catálogo</h1>
          <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Ver categorías →
          </Link>
        </div>
      </div>
      <CatalogPageEditForm slug={slug} catalog={rowToCatalog(row as CatalogRow)} />
    </div>
  )
}
