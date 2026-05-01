import type { Catalog, Category, Product, Money, ProductBadge } from '@/types';

// ─── Catalog ──────────────────────────────────────────────────────────────────

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
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    description: row.description ?? undefined,
    imageUrl:    row.image_url ?? undefined,
    sortOrder:   row.sort_order,
    isActive:    row.is_active,
  };
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryRow {
  id: string;
  catalog_id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export type CategoryInsertRow = Omit<CategoryRow, 'id'>;

export function rowToCategory(row: CategoryRow): Category {
  return {
    id:          row.id,
    name:        row.name,
    slug:        row.slug,
    catalogId:   row.catalog_id,
    description: row.description ?? undefined,
    sortOrder:   row.sort_order,
    isActive:    row.is_active,
  };
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductRow {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  money_amount: number;
  money_currency: string;
  is_available: boolean;
  is_featured: boolean;
  badge: string | null;
  image_url: string | null;
  sort_order: number;
}

export type ProductInsertRow = Omit<ProductRow, 'id'>;

export function rowToProduct(row: ProductRow): Product {
  const money: Money = {
    amount:   Number(row.money_amount),
    currency: row.money_currency,
  };

  return {
    id:          row.id,
    categoryId:  row.category_id,
    name:        row.name,
    slug:        row.slug,
    description: row.description ?? '',
    money,
    badge:       (row.badge as ProductBadge) ?? undefined,
    imageUrl:    row.image_url ?? undefined,
    isAvailable: row.is_available,
    isFeatured:  row.is_featured,
    sortOrder:   row.sort_order,
  };
}
