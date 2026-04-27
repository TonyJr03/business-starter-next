import type { BlogPost } from '@/types';

/**
 * Capa de servicios para el blog.
 *
 * TODO: implementar lectura desde Supabase o CMS.
 * El módulo de blog está deshabilitado mientras no exista persistencia.
 */

/** Devuelve todos los artículos ordenados por fecha descendente. */
export async function getPosts(): Promise<BlogPost[]> {
  return [];
}

/** Devuelve un artículo por slug, o undefined si no existe. */
export async function getPostBySlug(_slug: string): Promise<BlogPost | undefined> {
  return undefined;
}
