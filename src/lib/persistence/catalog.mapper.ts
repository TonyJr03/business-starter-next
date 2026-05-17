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
  created_at: string;
  updated_at: string;
}

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
  business_id: string;
  catalog_id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  business_id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  money: Money;
  is_available: boolean;
  is_featured: boolean;
  badge: ProductBadge | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id:          row.id,
    categoryId:  row.category_id,
    name:        row.name,
    slug:        row.slug,
    description: row.description ?? undefined,
    money:       { amount: Number(row.money.amount), currency: row.money.currency },
    badge:       row.badge ?? undefined,
    imageUrl:    row.image_url ?? undefined,
    isAvailable: row.is_available,
    isFeatured:  row.is_featured,
    sortOrder:   row.sort_order,
  };
}
