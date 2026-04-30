// ─── Catálogo ────────────────────────────────────────────────────────────────

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
  sortOrder?: number;
  isActive?: boolean;
}

// ─── Tipos primitivos ────────────────────────────────────────────────────────

/** Valor monetario con divisa explícita (ISO 4217). */
export interface Money {
  /** Cantidad numérica (ej. 25.00). */
  amount: number;
  /** Código de divisa ISO 4217 (ej. 'CUP', 'USD', 'EUR'). */
  currency: string;
}

// ─── Etiquetas y variantes ───────────────────────────────────────────────────

/**
 * Etiqueta personalizada de producto.
 * Permite categorizar productos con criterios propios del negocio.
 */
export interface ProductTag {
  /** Identificador único de la etiqueta. */
  id: string;
  /** Texto visible en la UI (ej. 'Vegano', 'Sin gluten'). */
  label: string;
  /** Color CSS opcional para distinguir visualmente la etiqueta. */
  color?: string;
}

/**
 * Variante de producto — presentaciones alternativas del mismo ítem
 * (tamaño, volumen, sabor, etc.).
 */
export interface ProductVariant {
  /** Identificador único de la variante. */
  id: string;
  /** Nombre descriptivo (ej. 'Grande', '500 ml', 'Sin azúcar'). */
  name: string;
  /** Precio absoluto de la variante; anula priceModifier si está presente. */
  price?: Money;
  /**
   * Modificador relativo al precio base del producto.
   * Positivo = recargo, negativo = descuento. Se ignora si price está definido.
   */
  priceModifier?: number;
  /** Indica si esta variante está disponible para pedido. */
  isAvailable: boolean;
  /** Posición en el listado de variantes. */
  sortOrder?: number;
}

// ─── Insignia rápida (retrocompatibilidad) ───────────────────────────────────

/**
 * Insignia visual predefinida para destacar un producto con un vistazo.
 * Para etiquetas personalizadas, usar ProductTag[].
 */
export type ProductBadge = 'new' | 'popular' | 'offer';

// ─── Categoría ───────────────────────────────────────────────────────────────

/** Agrupa productos bajo un criterio común dentro del catálogo. */
export interface Category {
  // ── Campos mínimos ────────────────────────────────────────────────────────
  /** Identificador único (ej. 'cat-1'). */
  id: string;
  /** Nombre visible en la interfaz. */
  name: string;
  /** Segmento URL único (ej. 'cafes'). */
  slug: string;  
  /** Catálogo al que pertenece esta categoría. NOT NULL en BD; opcional en datos de fallback local. */
  catalogId?: string;
  // ── Campos opcionales ─────────────────────────────────────────────────────
  /** Descripción breve que aparece en listados y páginas de categoría. */
  description?: string;
  /** URL de imagen representativa de la categoría. */
  imageUrl?: string;
  /** Posición en el listado de categorías (menor = primero). */
  sortOrder?: number;
  /** Controla la visibilidad en el catálogo; se asume true si se omite. */
  isActive?: boolean;
}

// ─── Producto ────────────────────────────────────────────────────────────────

/** Ítem individual del catálogo: producto, plato, servicio, etc. */
export interface Product {
  // ── Campos mínimos ────────────────────────────────────────────────────────
  /** Identificador único (ej. 'prod-1'). */
  id: string;
  /** Referencia a Category.id. */
  categoryId: string;
  /** Nombre visible en la interfaz. */
  name: string;
  /** Segmento URL único dentro de la categoría. */
  slug: string;
  /** Descripción completa del producto. */
  description: string;
  /** Precio con divisa ISO 4217 (ej. { amount: 25, currency: 'CUP' }). */
  money: Money;

  // ── Campos opcionales ─────────────────────────────────────────────────────
  /** URL de la imagen principal del producto. */
  imageUrl?: string;
  /** Galería de imágenes adicionales. */
  gallery?: string[];
  /** Etiquetas personalizadas (vegano, sin gluten, etc.). */
  tags?: ProductTag[];
  /** Insignia visual predefinida (retrocompatibilidad con badge). */
  badge?: ProductBadge;
  /** Variantes disponibles (talla, volumen, presentación). */
  variants?: ProductVariant[];
  /** Indica si el producto puede pedirse; se asume true si se omite. */
  isAvailable?: boolean;
  /** Aparece en secciones de destacados de la página principal. */
  isFeatured?: boolean;
  /** Posición en el listado dentro de la categoría. */
  sortOrder?: number;
}
