import Link from 'next/link'
import { BlogNewForm } from './BlogNewForm'

interface Props { params: Promise<{ slug: string }> }

export default async function NewBlogPostPage({ params }: Props) {
  const { slug } = await params
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href={`/negocios/${slug}/admin/blog`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Blog
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Nuevo artículo</h1>
      </div>
      <BlogNewForm slug={slug} />
    </div>
  )
}
