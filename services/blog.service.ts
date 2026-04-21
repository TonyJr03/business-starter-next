import type { BlogPost } from '@/types';
import { blogPosts } from '@/data';

/**
 * Capa de servicios para el blog.
 *
 * Actualmente devuelve datos locales tipados.
 * En el futuro consultará Supabase o un CMS sin cambiar el contrato.
 */

/** Devuelve todos los artículos ordenados por fecha descendente (más nuevos primero). */
export async function getPosts(): Promise<BlogPost[]> {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/** Devuelve un artículo por slug, o undefined si no existe. */
export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return blogPosts.find((p) => p.slug === slug);
}
