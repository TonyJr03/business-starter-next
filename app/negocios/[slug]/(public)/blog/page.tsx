/**
 * Blog — listado de artículos del negocio
 *
 * Ruta: /negocios/[slug]/blog
 * Acceso: público
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug, getPosts } from '@/services'
import { resolvePageModule } from '@/lib/modules/resolver'
import { Section } from '@/components/ui/Section'
import { BlogPostCard } from '@/components/sections/BlogPostCard'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    title: 'Blog',
    description: `Artículos, contenido y novedades de ${business?.name ?? ''}.`,
    openGraph: {
      url: `/negocios/${slug}/blog`,
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params

  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()

  // Guarda de módulo — respeta overrides por tenant
  const blogModule = resolvePageModule(business, 'blog')
  if (!blogModule.enabled) notFound()
  const posts = await getPosts(business.id)

  return (
    <>
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            {blogModule.title ?? 'Blog'}
          </h1>
          {blogModule.subtitle && (
            <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              {blogModule.subtitle}
            </p>
          )}
        </div>
      </Section>

      {/* ── Listado ────────────────────────────────────────────────── */}
      <Section bg="default" size="md">
        <div className="max-w-5xl mx-auto">
          {posts.length > 0 ? (
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
            >
              {posts.map((post) => (
                <li key={post.slug}>
                  <BlogPostCard
                    post={post}
                    href={`/negocios/${slug}/blog/${post.slug}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="text-center py-12"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No hay artículos publicados todavía.
            </p>
          )}
        </div>
      </Section>
    </>
  )
}
