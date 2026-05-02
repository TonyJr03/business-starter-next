import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { PhotoEditForm } from './PhotoEditForm'

interface Props { params: Promise<{ slug: string; albumId: string; photoId: string }> }

export default async function EditPhotoPage({ params }: Props) {
  const { slug, albumId, photoId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('gallery_photos')
    .select('id, image_url, alt, caption, sort_order, is_active, album_id')
    .eq('id', photoId)
    .eq('album_id', albumId)
    .single()

  if (!row) notFound()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/gallery/${albumId}/photos`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Fotos
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Editar foto</h1>
      </div>
      <PhotoEditForm
        slug={slug}
        albumId={albumId}
        photo={{
          id:        row.id,
          imageUrl:  row.image_url,
          alt:       row.alt,
          caption:   row.caption   ?? '',
          sortOrder: row.sort_order,
          isActive:  row.is_active,
        }}
      />
    </div>
  )
}
