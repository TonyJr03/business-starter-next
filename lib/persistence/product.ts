import type { Product, Money, ProductBadge, ProductTag } from '@/types';

export interface ProductRow {
  id: string;
  business_id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  money_amount: number;
  money_currency: string;
  is_available: boolean;
  is_featured: boolean;
  badge: string | null;
  tags: ProductTag[] | null;
  image_url: string | null;
  sort_order: number;
}

export type ProductInsertRow = Omit<ProductRow, 'id' | 'business_id'>;

export function rowToProduct(row: ProductRow): Product {
  const money: Money = {
    amount: Number(row.money_amount),
    currency: row.money_currency,
  };

  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    money,
    badge: (row.badge as ProductBadge) ?? undefined,
    imageUrl: row.image_url ?? undefined,
    tags: row.tags ?? undefined,
    isAvailable: row.is_available,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
  };
}
