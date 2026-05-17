// ─── Tipos primitivos ────────────────────────────────────────────────────────

/** Valor monetario con divisa explícita (ISO 4217). */
export interface Money {
  /** Cantidad numérica (ej. 25.00). */
  amount: number;
  /** Código de divisa ISO 4217 (ej. 'CUP', 'USD', 'EUR'). */
  currency: string;
}

/**
 * Insignia visual predefinida para destacar un producto.
 * Para etiquetas personalizadas, se implementarán en un sprint futuro.
 */
export type ProductBadge = 'new' | 'popular' | 'offer';

// ─── Catalog ─────────────────────────────────────────────────────────────────

/**
 * Agrupador de categorías. Un negocio puede tener uno o más catálogos.
 *
 * Regla de dominio:
 *   - Siempre hay al menos un catálogo por negocio.
 *   - Con un solo catálogo, la UI lo trata como catálogo único (sin selección).
 *   - Con dos o más, activa el modo multi-catálogo: página de selección +
 *     sub-rutas /catalog/[catalogSlug] + dropdown en la navegación.
 */
export interface Catalog {
  id: string;
  /** Segmento URL único del catálogo dentro del negocio (ej. 'cafeteria'). */
  slug: string;
  /** Nombre visible en la UI (ej. 'Cafetería'). */
  name: string;
  description?: string;
  imageUrl?: string;
  /** Posición en el listado (menor = primero). */
  sortOrder?: number;
  /** Controla la visibilidad; se asume true si se omite. */
  isActive?: boolean;
}

// ─── Category ────────────────────────────────────────────────────────────────

/** Agrupa productos bajo un criterio común dentro de un catálogo. */
export interface Category {
  id: string;
  /** Catálogo al que pertenece esta categoría. */
  catalogId: string;
  /** Segmento URL único dentro del catálogo (ej. 'cafes'). */
  slug: string;
  /** Nombre visible en la interfaz. */
  name: string;
  /** Descripción breve que aparece en listados y páginas de categoría. */
  description?: string;
  /** Posición en el listado (menor = primero). */
  sortOrder?: number;
  /** Controla la visibilidad; se asume true si se omite. */
  isActive?: boolean;
}

// ─── Product ─────────────────────────────────────────────────────────────────

/** Ítem individual del catálogo: producto, plato, servicio, etc. */
export interface Product {
  id: string;
  /** Referencia a Category.id. */
  categoryId: string;
  /** Segmento URL único dentro de la categoría. */
  slug: string;
  /** Nombre visible en la interfaz. */
  name: string;
  description?: string;
  /** Precio con divisa ISO 4217 (ej. { amount: 25, currency: 'CUP' }). */
  money: Money;
  /** Disponible para pedir; se asume true si se omite. */
  isAvailable?: boolean;
  /** Aparece en secciones de destacados; se asume false si se omite. */
  isFeatured?: boolean;
  /** Insignia visual predefinida. */
  badge?: ProductBadge;
  /** URL de la imagen principal del producto. */
  imageUrl?: string;
  /** Posición en el listado dentro de la categoría (menor = primero). */
  sortOrder?: number;
}
