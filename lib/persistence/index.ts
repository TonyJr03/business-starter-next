/**
 * Stub mínimo para M1 — tipos y mappers vacíos.
 * En M2, se portan desde persistence/ del proyecto Astro.
 */

import type { Category, Product, Promotion } from '@/types';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}

export interface ProductRow {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  amount: number;
  currency: string;
  image_url?: string | null;
  gallery?: string[] | null;
  is_available?: boolean | null;
  is_featured?: boolean | null;
  sort_order?: number | null;
}

export interface PromotionRow {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  discount_label?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  starts_at?: string | null;
  ends_at?: string | null;
  rules?: unknown | null;
  product_ids?: string[] | null;
  category_ids?: string[] | null;
  sort_order?: number | null;
}

export interface BusinessSettingsRow {
  id: string;
  slug: string;
  name: string;
  short_description?: string | null;
  whatsapp: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city: string;
  country: string;
  social?: Record<string, string> | null;
  hours?: unknown | null;
}

export interface BusinessSettings {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  whatsapp: string;
  phone?: string;
  email?: string;
  address?: string;
  city: string;
  country: string;
  social?: Record<string, string | undefined>;
  hours?: unknown;
}

/**
 * Placeholder mappers — devuelven null siempre.
 * En M2, implementarán la lógica real de transformación BD → dominio.
 */
export function rowToCategory(_row: CategoryRow): Category | null {
  return null;
}

export function rowToProduct(_row: ProductRow): Product | null {
  return null;
}

export function rowToPromotion(_row: PromotionRow): Promotion | null {
  return null;
}

export function rowToBusinessSettings(_row: BusinessSettingsRow): BusinessSettings | null {
  return null;
}
