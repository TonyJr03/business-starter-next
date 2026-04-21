// ─── Estado ──────────────────────────────────────────────────────────────────

/**
 * Estado del ciclo de vida de una promoción.
 * Puede derivarse de las fechas o definirse explícitamente.
 */
export type PromotionStatus = 'upcoming' | 'active' | 'expired' | 'paused';

// ─── Regla de promoción ──────────────────────────────────────────────────────

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
  /** Descripción legible para mostrar al cliente o en el panel de admin. */
  description?: string;
}

// ─── Promoción ───────────────────────────────────────────────────────────────

/** Oferta especial, campaña de descuento o bundle del negocio. */
export interface Promotion {
  // ── Campos mínimos ────────────────────────────────────────────────────────
  /** Identificador único (ej. 'promo-1'). */
  id: string;
  /** Título visible en la interfaz (ej. 'Desayuno Completo'). */
  title: string;
  /** Descripción completa de la oferta para el cliente. */
  description: string;

  // ── Campos opcionales ─────────────────────────────────────────────────────
  /** URL de imagen ilustrativa de la promoción. */
  imageUrl?: string;
  /** Etiqueta visual corta para llamar la atención (ej. '20% OFF', '2×1'). */
  discountLabel?: string;
  /**
   * Estado explícito del ciclo de vida.
   * Si se omite, puede derivarse comparando startsAt/endsAt con la fecha actual.
   */
  status?: PromotionStatus;
  /**
   * Visibilidad activa de la promoción (retrocompatibilidad).
   * Equivale a status === 'active' cuando no se usa PromotionStatus.
   */
  isActive?: boolean;
  /** Fecha/hora de inicio en formato ISO 8601 (ej. '2026-04-01'). */
  startsAt?: string;
  /** Fecha/hora de fin en formato ISO 8601 (ej. '2026-04-30'). */
  endsAt?: string;
  /** Reglas que definen las condiciones y el beneficio de esta promoción. */
  rules?: PromotionRule[];
  /** Productos específicos a los que aplica (IDs de Product). */
  productIds?: string[];
  /** Categorías a las que aplica (IDs de Category). */
  categoryIds?: string[];
  /** Posición en el listado de promociones (menor = primero). */
  sortOrder?: number;
}
