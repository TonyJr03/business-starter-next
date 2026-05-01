import { cache } from 'react';
import type { Catalog, Category, Product } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  type CatalogRow, rowToCatalog,
  type CategoryRow, rowToCategory,
  type ProductRow, rowToProduct,
} from '@/lib/persistence';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Opciones de filtrado para getCategories(). */
export interface CategoryFilters {
  /** Devuelve solo categorías de este catálogo. */
  catalogId?: string;
}

/** Opciones de filtrado para getProducts(). */
export interface ProductFilters {
  /** Devuelve solo productos de esta categoría. */
  categoryId?: string;
  /** Devuelve solo productos de cualquiera de estas categorías (OR). */
  categoryIds?: string[];
  /** Si es false, incluye productos no disponibles. Por defecto: true. */
  onlyAvailable?: boolean;
  /** Devuelve solo productos marcados como destacados. */
  onlyFeatured?: boolean;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchCatalogsFromDB(): Promise<Catalog[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('catalog_pages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as CatalogRow[]).map(rowToCatalog);
}

async function fetchCategoriesFromDB(filters?: CategoryFilters): Promise<Category[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  let query = db
    .from('catalog_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (filters?.catalogId) {
    query = query.eq('catalog_id', filters.catalogId);
  }

  const { data, error } = await query;

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as CategoryRow[]).map(rowToCategory).filter((x): x is Category => x !== null);
}

async function fetchProductsFromDB(filters?: ProductFilters): Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  let query = db.from('catalog_products').select('*').order('sort_order');

  if (filters?.onlyAvailable !== false) {
    query = query.eq('is_available', true);
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.categoryIds && filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds);
  }

  if (filters?.onlyFeatured) {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query;

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as ProductRow[])
    .map(rowToProduct)
    .filter((x): x is Product => x !== null);
}

async function fetchProductBySlugFromDB(slug: string): Promise<Product | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return undefined;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('catalog_products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error:', error.message);
    }
    return undefined;
  }

  if (!data) return undefined;

  return rowToProduct(data as ProductRow);
}

async function fetchCatalogBySlug(slug: string): Promise<Catalog | undefined> {
  const all = await fetchCatalogsFromDB();
  return all.find((c) => c.slug === slug);
}

async function fetchFeaturedProducts(categoryIds?: string[]): Promise<Product[]> {
  return fetchProductsFromDB({ onlyFeatured: true, onlyAvailable: true, categoryIds });
}

async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  return fetchProductsFromDB({ categoryId, onlyAvailable: true });
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getCatalogs = cache(fetchCatalogsFromDB);
export const getCatalogBySlug = cache(fetchCatalogBySlug);
export const getCategories = cache(fetchCategoriesFromDB);
export const getProducts = cache(fetchProductsFromDB);
export const getProductBySlug = cache(fetchProductBySlugFromDB);
export const getFeaturedProducts = cache(fetchFeaturedProducts);
export const getProductsByCategory = cache(fetchProductsByCategory);

// ─── Helpers de dominio ───────────────────────────────────────────────────────

export function isProductAvailable(product: Product): boolean {
  return product.isAvailable ?? true;
}
