/**
 * BlogPostCard — Server Component
 *
 * Card de vista previa de artículo para el listado del blog.
 * El href recibe el path completo para respetar el tenant path-based.
 *
 * Equivalente de BlogPostCard.astro.
 */
import Link from 'next/link'
import type { BlogPost } from '@/types'

interface BlogPostCardProps {
  post: BlogPost
  /** Path completo del post (ej. /negocios/cafe-la-esquina/blog/mi-post) */
  href: string
}

const dateFormatter = new Intl.DateTimeFormat('es-CU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Havana',
})

export function BlogPostCard({ post, href }: BlogPostCardProps) {
  const formattedDate = dateFormatter.format(new Date(`${post.publishedAt}T00:00:00`))

  return (
    <Link
      href={href}
      className="group flex flex-col h-full rounded-2xl border overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card-elevated, 0 4px 12px rgba(0,0,0,0.08))',
      }}
    >
      <div className="flex flex-col gap-3 p-6 h-full">

        {/* Fecha */}
        <time
          dateTime={post.publishedAt}
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          {formattedDate}
        </time>

        {/* Título */}
        <h2
          className="text-lg font-bold leading-snug group-hover:underline underline-offset-2"
          style={{ color: 'var(--color-text)' }}
        >
          {post.title}
        </h2>

        {/* Resumen */}
        <p
          className="text-sm leading-relaxed flex-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {post.summary}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-1" aria-label="Etiquetas">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text-muted)',
                }}
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}

        {/* Leer más */}
        <span
          className="mt-2 text-sm font-semibold"
          style={{ color: 'var(--color-primary)' }}
          aria-hidden="true"
        >
          Leer artículo →
        </span>

      </div>
    </Link>
  )
}
