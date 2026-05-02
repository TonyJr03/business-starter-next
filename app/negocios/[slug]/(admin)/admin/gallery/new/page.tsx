import Link from 'next/link'
import { AlbumNewForm } from './AlbumNewForm'

interface Props { params: Promise<{ slug: string }> }

export default async function NewAlbumPage({ params }: Props) {
  const { slug } = await params
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/gallery`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Galería
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Nuevo álbum</h1>
      </div>
      <AlbumNewForm slug={slug} />
    </div>
  )
}
