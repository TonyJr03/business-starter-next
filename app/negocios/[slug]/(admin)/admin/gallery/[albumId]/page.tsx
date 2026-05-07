import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { rowToGalleryAlbum } from '@/lib/persistence'
import type { GalleryAlbumRow } from '@/lib/persistence'
import { AlbumEditForm } from './AlbumEditForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; albumId: string }> }

export default async function EditAlbumPage({ params }: Props) {
  const { slug, albumId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('gallery_albums')
    .select('id, slug, name, description, sort_order, is_active')
    .eq('id', albumId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!row) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/gallery`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Galería
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Editar álbum</h1>
          <Link href={`/negocios/${slug}/admin/gallery/${albumId}/photos`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Ver fotos →
          </Link>
        </div>
      </div>
      <AlbumEditForm slug={slug} album={rowToGalleryAlbum(row as GalleryAlbumRow)} />
    </div>
  )
}
