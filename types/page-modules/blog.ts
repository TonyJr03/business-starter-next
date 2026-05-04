/** Un artículo de blog individual. */
export interface BlogPost {
  id: string;
  /** Slug seguro para URL, único por negocio. */
  slug: string;
  title: string;
  /** Descripción de una oración para listados y meta tags. */
  summary?: string;
  /** Cuerpo del artículo como lista ordenada de párrafos. */
  body: string[];
  /** Fecha de publicación ISO 8601 (YYYY-MM-DD). */
  publishedAt?: string;
  author?: string;
  tags: string[];
  /** Controla la visibilidad; se asume true si se omite. */
  isPublished?: boolean;
}
