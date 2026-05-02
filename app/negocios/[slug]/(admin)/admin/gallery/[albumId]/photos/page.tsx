import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface Props { params: Promise<{ slug: string; albumId: string }>, searchParams: Promise<{ created?: string; updated?: string; deleted?: string }> }

export default async function PhotosListPage({ params, searchParams }: Props) {
  const { slug, albumId } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: album } = await ctx.supabase
    .from('gallery_albums')
    .select('id, name')
    .eq('id', albumId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!album) notFound()

  const { data: rows, error: queryError } = await ctx.supabase
    .from('gallery_photos')
    .select('id, image_url, alt, caption, sort_order, is_active')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: true })

  const photos = rows ?? []

  return (
    <div className="space-y-5">

      <AdminPageHeader
        title={`Fotos · ${album.name}`}
        description={`${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'}`}
        action={
          <Link href={`/negocios/${slug}/admin/gallery/${albumId}/photos/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
            + Nueva foto
          </Link>
        }
      />

      <div className="text-xs text-zinc-400 dark:text-zinc-500">
        <Link href={`/negocios/${slug}/admin/gallery`} className="hover:text-zinc-600 dark:hover:text-zinc-300">Galería</Link>
        {' › '}
        <Link href={`/negocios/${slug}/admin/gallery/${albumId}`} className="hover:text-zinc-600 dark:hover:text-zinc-300">{album.name}</Link>
        {' › Fotos'}
      </div>

      {sp.created === '1' && <AdminAlert type="success" message="Foto añadida correctamente." />}
      {sp.updated === '1' && <AdminAlert type="success" message="Foto actualizada correctamente." />}
      {sp.deleted === '1' && <AdminAlert type="neutral"  message="Foto eliminada." />}
      {queryError  && <AdminAlert type="error"   message="No se pudieron cargar las fotos. Por favor, recarga la página." />}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {photos.length === 0 ? (
          <AdminEmptyState
            title="No hay fotos en este álbum."
            description="Añade fotos para mostrar en la galería pública."
            action={
              <Link href={`/negocios/${slug}/admin/gallery/${albumId}/photos/new`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                Añadir primera foto
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Alt / Caption</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden md:table-cell">Orden</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {photos.map((photo: {
                id: string; image_url: string; alt: string
                caption: string | null; sort_order: number; is_active: boolean
              }) => (
                <tr key={photo.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{photo.alt}</div>
                    {photo.caption && <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate max-w-xs">{photo.caption}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      photo.is_active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {photo.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">{photo.sort_order}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/negocios/${slug}/admin/gallery/${albumId}/photos/${photo.id}`}
                      className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
