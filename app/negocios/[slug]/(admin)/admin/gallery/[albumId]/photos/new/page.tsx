import Link from 'next/link'
import { PhotoNewForm } from './PhotoNewForm'

// ─── Página ──────────────────────────────────────────────────────────────────

interface Props { params: Promise<{ slug: string; albumId: string }> }

export default async function NewPhotoPage({ params }: Props) {
  const { slug, albumId } = await params
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/negocios/${slug}/admin/gallery/${albumId}/photos`}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-4">
          ← Fotos
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Nueva foto</h1>
      </div>
      <PhotoNewForm slug={slug} albumId={albumId} />
    </div>
  )
}
