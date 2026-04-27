import type { Category, Product } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  type CategoryRow,
  rowToCategory,
} from '@/lib/persistence/category';
import {
  type ProductRow,
  rowToProduct,
} from '@/lib/persistence/product';

/**
 * Servicio de catálogo — lectura de categorías y productos.
 *
 * Fuente de datos: Supabase.
 * Si Supabase no está disponible o la consulta falla, se devuelve array vacío.
 * No existe fallback a datos locales — la ausencia de datos es un estado válido.
 *
 * Contrato estable: las firmas públicas no cambian al migrar la fuente.
 *
 * Valores por defecto del dominio para campos opcionales:
 *   isActive    → true   (visible si no se especifica lo contrario)
 *   isAvailable → true   (disponible salvo marca explícita)
 *   isFeatured  → false  (no destacado por defecto)
 *   sortOrder   → 0      (al final del listado)
 */

// ─── Filtros ─────────────────────────────────────────────────────────────────

/** Opciones de filtrado para getProducts(). */
export interface ProductFilters {
  /** Devuelve solo productos de esta categoría. */
  categoryId?: string;
  /** Si es false, incluye productos no disponibles. Por defecto: true. */
  onlyAvailable?: boolean;
  /** Devuelve solo productos marcados como destacados. */
  onlyFeatured?: boolean;
}

// ─── Lectores privados de Supabase ────────────────────────────────────────────
// Devuelven null si Supabase no está disponible o falla la consulta,
// lo que activa el fallback a datos locales en cada función pública.

async function fetchCategoriesFromDB(): Promise<Category[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error al leer categorías de Supabase:', error.message);
    }
    return null;
  }

  if (!data || data.length === 0) return null;

  return (data as CategoryRow[]).map(rowToCategory).filter((x): x is Category => x !== null);
}

async function fetchProductsFromDB(filters?: ProductFilters): Promise<Product[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createSupabaseServerClient();

  let query = db.from('products').select('*').order('sort_order');

  if (filters?.onlyAvailable !== false) {
    query = query.eq('is_available', true);
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.onlyFeatured) {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query;

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error al leer productos de Supabase:', error.message);
    }
    return null;
  }

  if (!data || data.length === 0) return null;

  return (data as ProductRow[])
    .map(rowToProduct)
    .filter((x): x is Product => x !== null);
}

async function fetchProductBySlugFromDB(slug: string): Promise<Product | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[catalog.service] Error al buscar producto por slug en Supabase:', error.message);
    }
    return null;
  }

  if (!data) return null;

  return rowToProduct(data as ProductRow);
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve todas las categorías activas, ordenadas por sortOrder.
 * Fuente: Supabase. Devuelve [] si no hay datos o Supabase no está disponible.
 */
export async function getCategories(): Promise<Category[]> {
  return (await fetchCategoriesFromDB()) ?? [];
}

/**
 * Devuelve productos aplicando los filtros indicados.
 * Si no se pasan filtros, devuelve todos los disponibles ordenados.
 * Fuente: Supabase. Devuelve [] si no hay datos o Supabase no está disponible.
 */
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  return (await fetchProductsFromDB(filters)) ?? [];
}

/**
 * Devuelve productos destacados y disponibles, ordenados por sortOrder.
 * Equivale a getProducts({ onlyFeatured: true, onlyAvailable: true }).
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ onlyFeatured: true, onlyAvailable: true });
}

/**
 * Devuelve todos los productos disponibles de una categoría concreta.
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return getProducts({ categoryId, onlyAvailable: true });
}

/**
 * Busca un producto por su slug.
 * Devuelve undefined si no existe o Supabase no está disponible.
 * Fuente: Supabase.
 */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await fetchProductBySlugFromDB(slug)) ?? undefined;
}

// ─── Helpers de dominio ───────────────────────────────────────────────────────

/**
 * Regla de dominio: un producto está disponible si `isAvailable` es true
 * o si el campo está ausente (undefined). La ausencia significa "disponible".
 *
 * Usar este helper en lugar de acceder a `product.isAvailable` directamente
 * para evitar el bug de `!undefined === true`.
 */
export function isProductAvailable(product: Product): boolean {
  return product.isAvailable ?? true;
}
