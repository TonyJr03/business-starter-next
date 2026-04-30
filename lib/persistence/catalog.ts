import type { Catalog } from '@/types';

export interface CatalogRow {
  id: string;
  business_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export type CatalogInsertRow = Omit<CatalogRow, 'id' | 'business_id'>;

export function rowToCatalog(row: CatalogRow): Catalog {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}
