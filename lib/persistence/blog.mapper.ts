import type { BlogPost } from '@/types';

export interface BlogPostRow {
  id: string;
  business_id: string;
  slug: string;
  title: string;
  summary: string;
  body: string[];
  published_at: string;   // DATE → string 'YYYY-MM-DD'
  author: string | null;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function rowToBlogPost(row: BlogPostRow): BlogPost {
  return {
    slug:        row.slug,
    title:       row.title,
    summary:     row.summary,
    body:        row.body,
    publishedAt: row.published_at,
    author:      row.author ?? undefined,
    tags:        row.tags ?? undefined,
  };
}
