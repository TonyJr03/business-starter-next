import type { BlogPost } from '@/types';

export interface BlogPostRow {
  id: string;
  business_id: string;
  slug: string;
  title: string;
  summary: string | null;      
  body: string[];
  published_at: string | null;
  author: string | null;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function rowToBlogPost(row: BlogPostRow): BlogPost {
  return {
    id:          row.id,
    slug:        row.slug,
    title:       row.title,
    summary:     row.summary ?? undefined,
    body:        row.body,
    publishedAt: row.published_at ?? undefined,
    author:      row.author ?? undefined,
    tags:        row.tags,
    isPublished: row.is_published,
  };
}
