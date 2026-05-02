import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface Props { params: Promise<{ slug: string }>, searchParams: Promise<{ created?: string; updated?: string; deleted?: string }> }

export default async function BlogListPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: rows, error: queryError } = await ctx.supabase
    .from('blog')
    .select('id, slug, title, summary, published_at, is_published, author')
    .eq('business_id', ctx.businessId)
    .order('published_at', { ascending: false })

  const posts = rows ?? []

  return (
    <div className="space-y-5">

      <AdminPageHeader
        title="Blog"
        description={`${posts.length} ${posts.length === 1 ? 'artículo' : 'artículos'}`}
        action={
          <Link href={`/negocios/${slug}/admin/blog/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
            + Nuevo artículo
          </Link>
        }
      />

      {sp.created === '1' && <AdminAlert type="success" message="Artículo creado correctamente." />}
      {sp.updated === '1' && <AdminAlert type="success" message="Artículo actualizado correctamente." />}
      {sp.deleted === '1' && <AdminAlert type="neutral"  message="Artículo eliminado." />}
      {queryError  && <AdminAlert type="error"   message="No se pudieron cargar los artículos. Por favor, recarga la página." />}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        {posts.length === 0 ? (
          <AdminEmptyState
            title="No hay artículos aún."
            description="Comparte noticias, novedades y contenido de valor con tus clientes."
            action={
              <Link href={`/negocios/${slug}/admin/blog/new`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                Escribir primer artículo
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Publicado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {posts.map((post: {
                id: string; slug: string; title: string; summary: string
                published_at: string; is_published: boolean; author: string | null
              }) => (
                <tr key={post.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{post.title}</div>
                    {post.author && <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{post.author}</div>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                    {post.published_at}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      post.is_published
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {post.is_published ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/negocios/${slug}/admin/blog/${post.id}`}
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
