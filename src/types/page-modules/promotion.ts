// ─── Tipos de apoyo ───────────────────────────────────────────────────────────

/** Estado del ciclo de vida de una promoción. */
export type PromotionStatus = 'upcoming' | 'active' | 'expired' | 'paused';

/**
 * Tipo de descuento — determina cómo se calcula el beneficio para el cliente.
 *
 * - percentage: descuento en porcentaje sobre el precio (ej. 20%)
 * - fixed:      descuento en monto fijo (ej. 10 CUP)
 * - bogo:       compra uno y lleva otro (buy one get one)
 * - combo:      precio especial por conjunto de productos
 * - custom:     lógica propia del negocio, descrita en PromotionRule.description
 */
export type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'combo' | 'custom';

/**
 * Regla simple de promoción.
 * Define la condición y el beneficio que activa la oferta.
 */
export interface PromotionRule {
  /** Cómo se aplica el descuento. */
  type: DiscountType;
  /**
   * Valor numérico del descuento.
   * Para 'percentage': número del 0 al 100.
   * Para 'fixed': monto en la divisa del negocio.
   * Se omite en 'bogo', 'combo' y 'custom'.
   */
  value?: number;
  /** Cantidad mínima de ítems necesaria para activar la regla. */
  minItems?: number;
  /** Productos específicos a los que aplica esta regla (IDs de Product). */
  productIds?: string[];
  /** Categorías a las que aplica esta regla (IDs de Category). */
  categoryIds?: string[];
  /** Número máximo de usos antes de desactivar la regla. */
  maxUses?: number;
  description?: string;
}

// ─── Promoción ───────────────────────────────────────────────────────────────

/** Oferta especial, campaña de descuento o bundle del negocio. */
export interface Promotion {
  id: string;
  /** Título visible en la interfaz (ej. 'Desayuno Completo'). */
  title: string;
  description?: string;
  imageUrl?: string;
  status: PromotionStatus;
  /** Etiqueta visual corta para llamar la atención (ej. '20% OFF', '2×1'). */
  discountLabel?: string;
  /** Fecha/hora de inicio en formato ISO 8601. */
  startsAt?: string;
  /** Fecha/hora de fin en formato ISO 8601. */
  endsAt?: string;
  rules?: PromotionRule[];
  /** Posición en el listado (menor = primero). */
  sortOrder?: number;
}
