/**
 * Blog post — detalle de artículo
 *
 * Ruta: /negocios/[slug]/blog/[post]
 * Acceso: público
 *
 * Si el post no existe, devuelve 404 idiomático via notFound().
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { globalConfig } from '@/config'
import { getPostBySlug } from '@/services/blog.service'
import { Section } from '@/components/ui/Section'

interface Props {
  params: Promise<{ slug: string; post: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, post: postSlug } = await params
  const blogPost = await getPostBySlug(postSlug)

  if (!blogPost) {
    return { title: 'Artículo no encontrado' }
  }

  return {
    title: blogPost.title,
    description: blogPost.summary,
    openGraph: {
      url: `/negocios/${slug}/blog/${postSlug}`,
    },
  }
}

const dateFormatter = new Intl.DateTimeFormat('es-CU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Havana',
})

export default async function BlogPostPage({ params }: Props) {
  const { slug, post: postSlug } = await params
  const { modules } = globalConfig

  // Guarda de módulo — 404 si está deshabilitado
  if (!modules.pages.blog.enabled) notFound()

  // Post no encontrado → 404 idiomático
  const post = await getPostBySlug(postSlug)
  if (!post) notFound()

  const formattedDate = dateFormatter.format(new Date(`${post.publishedAt}T00:00:00`))

  return (
    <>
      {/* ── Encabezado del artículo ─────────────────────────────────── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">

          {/* Fecha */}
          <time
            dateTime={post.publishedAt}
            className="block text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-accent)' }}
          >
            {formattedDate}
          </time>

          {/* Título */}
          <h1
            className="text-4xl font-bold tracking-tight leading-snug mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            {post.title}
          </h1>

          {/* Resumen */}
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {post.summary}
          </p>

          {/* Autor */}
          {post.author && (
            <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Por{' '}
              <span
                className="font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                {post.author}
              </span>
            </p>
          )}

        </div>
      </Section>

      {/* ── Cuerpo del artículo ─────────────────────────────────────── */}
      <Section bg="default" size="md">
        <article className="max-w-2xl mx-auto">

          <div className="space-y-6">
            {post.body.map((paragraph, i) => (
              <p
                key={i}
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text)' }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <footer
              className="mt-10 pt-6 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <ul className="flex flex-wrap gap-2" aria-label="Etiquetas">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </footer>
          )}

          {/* Volver al listado */}
          <div className="mt-10">
            <a
              href={`/negocios/${slug}/blog`}
              className="text-sm font-semibold transition-opacity hover:opacity-75"
              style={{ color: 'var(--color-primary)' }}
            >
              ← Volver al blog
            </a>
          </div>

        </article>
      </Section>
    </>
  )
}
