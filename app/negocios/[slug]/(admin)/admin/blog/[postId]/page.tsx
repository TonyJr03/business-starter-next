import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { BlogEditForm } from './BlogEditForm'

interface Props { params: Promise<{ slug: string; postId: string }> }

export default async function EditBlogPostPage({ params }: Props) {
  const { slug, postId } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('blog')
    .select('id, slug, title, summary, body, published_at, author, tags, is_published')
    .eq('id', postId)
    .eq('business_id', ctx.businessId)
    .single()

  if (!row) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={`/negocios/${slug}/admin/blog`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Blog
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Editar artículo</h1>
      </div>
      <BlogEditForm
        slug={slug}
        post={{
          id:          row.id,
          slug:        row.slug,
          title:       row.title,
          summary:     row.summary,
          body:        (row.body as string[]) ?? [],
          publishedAt: row.published_at,
          author:      row.author  ?? '',
          tags:        (row.tags   as string[]) ?? [],
          isPublished: row.is_published,
        }}
      />
    </div>
  )
}
