/**
 * Capa de persistencia: mappers BD → dominio
 * Portada desde Astro (src/lib/persistence/), sin cambios en la lógica.
 * Estrategia de lectura única: fila SQL → tipo dominio tipado.
 */

import type { Category, Product, Promotion, Money, ProductBadge, ProductTag, BusinessSocial, DayHours, PromotionStatus, PromotionRule } from '@/types';

// ═════════════════════════════════════════════════════════════════════════════
// CATEGORÍA
// ═════════════════════════════════════════════════════════════════════════════

export interface CategoryRow {
  id: string;
  business_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export type CategoryInsertRow = Omit<CategoryRow, 'id' | 'business_id'>;

export function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// PRODUCTO
// ═════════════════════════════════════════════════════════════════════════════

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

// ═════════════════════════════════════════════════════════════════════════════
// PROMOCIÓN
// ═════════════════════════════════════════════════════════════════════════════

export interface PromotionRow {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  status: PromotionStatus;
  discount_label: string | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  rules: PromotionRule[] | null;
  product_ids: string[] | null;
  category_ids: string[] | null;
  sort_order: number;
}

export type PromotionInsertRow = Omit<PromotionRow, 'id' | 'business_id'>;

export function rowToPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    discountLabel: row.discount_label ?? undefined,
    imageUrl: row.image_url ?? undefined,
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
    rules: row.rules ?? undefined,
    productIds: row.product_ids ?? undefined,
    categoryIds: row.category_ids ?? undefined,
    sortOrder: row.sort_order,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL NEGOCIO
// ═════════════════════════════════════════════════════════════════════════════

export interface BusinessSettingsRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  social: BusinessSocial | null;
  hours: DayHours[] | null;
}

export type BusinessSettingsInsertRow = Omit<BusinessSettingsRow, 'id'>;

export interface BusinessSettings {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  social?: BusinessSocial;
  hours?: DayHours[];
}

export function rowToBusinessSettings(row: BusinessSettingsRow): BusinessSettings {
  return {
    id:               row.id,
    slug:             row.slug,
    name:             row.name,
    shortDescription: row.short_description ?? undefined,
    whatsapp:         row.whatsapp ?? undefined,
    phone:            row.phone ?? undefined,
    email:            row.email ?? undefined,
    address:          row.address ?? undefined,
    city:             row.city ?? undefined,
    country:          row.country ?? undefined,
    social:           row.social ?? undefined,
    hours:            row.hours ?? undefined,
  };
}
