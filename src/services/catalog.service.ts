import { cache } from 'react';
import type { Catalog, Category, Product } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  type CatalogRow, rowToCatalog,
  type CategoryRow, rowToCategory,
  type ProductRow, rowToProduct,
} from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchCatalogsFromDB(businessId: string): Promise<Catalog[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('catalog_pages')
    .select('*')
    .eq('business_id', businessId)
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

async function fetchCategoriesFromDB(businessId: string): Promise<Category[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('catalog_categories')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as CategoryRow[]).map(rowToCategory);
}

async function fetchProductsFromDB(businessId: string): Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('catalog_products')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as ProductRow[]).map(rowToProduct);
}

async function fetchProductBySlugFromDB(businessId: string, productSlug: string): Promise<Product | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return undefined;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('catalog_products')
    .select('*')
    .eq('business_id', businessId)
    .eq('slug', productSlug)
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

// ─── Derived ──────────────────────────────────────────────────────────────────

async function fetchCatalogBySlug(businessId: string, slug: string): Promise<Catalog | undefined> {
  const all = await getCatalogs(businessId);
  return all.find((c) => c.slug === slug);
}

async function fetchCategoriesByCatalog(businessId: string, catalogId: string): Promise<Category[]> {
  const all = await getCategories(businessId);
  return all.filter((c) => c.catalogId === catalogId);
}

async function fetchProductsByCategory(businessId: string, categoryId: string): Promise<Product[]> {
  const all = await getProducts(businessId);
  return all.filter((p) => p.categoryId === categoryId && (p.isAvailable ?? true));
}

async function fetchFeaturedProducts(businessId: string, categoryIds?: string[]): Promise<Product[]> {
  const all = await getProducts(businessId);
  const featured = all.filter((p) => p.isFeatured && (p.isAvailable ?? true));
  if (!categoryIds || categoryIds.length === 0) return featured;
  return featured.filter((p) => p.categoryId && categoryIds.includes(p.categoryId));
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getCatalogs = cache(fetchCatalogsFromDB);
export const getCatalogBySlug = cache(fetchCatalogBySlug);
export const getCategories = cache(fetchCategoriesFromDB);
export const getCategoriesByCatalog = cache(fetchCategoriesByCatalog);
export const getProducts = cache(fetchProductsFromDB);
export const getProductBySlug = cache(fetchProductBySlugFromDB);
export const getFeaturedProducts = cache(fetchFeaturedProducts);
export const getProductsByCategory = cache(fetchProductsByCategory);
