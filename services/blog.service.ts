import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/types';
import { type BlogPostRow, rowToBlogPost } from '@/lib/persistence/blog';

/**
 * Servicio de blog — lectura desde BD.
 *
 * Fuente de datos: tabla `business_blog_posts`.
 * Degrada a array vacío / undefined si Supabase no está disponible o el
 * negocio no tiene posts — las páginas muestran estado vacío o 404.
 *
 * Contrato estable: las firmas públicas no cambian al migrar la fuente.
 */

const COLUMNS = 'id, business_id, slug, title, summary, body, published_at, author, tags, is_published, created_at, updated_at';

// ─── Listado ──────────────────────────────────────────────────────────────────

async function fetchPostsFromDB(businessId: string): Promise<BlogPost[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('business_blog_posts')
    .select(COLUMNS)
    .eq('business_id', businessId)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[blog.service] Error al leer business_blog_posts:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as BlogPostRow[]).map(rowToBlogPost);
}

/** Devuelve todos los artículos publicados del negocio, ordenados por fecha descendente. */
export const getPosts = cache(fetchPostsFromDB);

// ─── Detalle ──────────────────────────────────────────────────────────────────

async function fetchPostBySlugFromDB(
  businessId: string,
  slug: string,
): Promise<BlogPost | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return undefined;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('business_blog_posts')
    .select(COLUMNS)
    .eq('business_id', businessId)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[blog.service] Error al leer post por slug:', error.message);
    }
    return undefined;
  }

  if (!data) return undefined;

  return rowToBlogPost(data as BlogPostRow);
}

/** Devuelve un artículo publicado por slug, o undefined si no existe. */
export const getPostBySlug = cache(fetchPostBySlugFromDB);

