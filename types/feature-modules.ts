// ─── Feature Module IDs ───────────────────────────────────────────────────────

/**
 * Identificadores de funcionalidades transversales del negocio.
 * No tienen ruta propia, pero pueden activarse/desactivarse por tenant.
 */
export type FeatureModuleId = 'cart' | 'whatsappOrdering';

// ─── Feature Module Config ────────────────────────────────────────────────────

/** Configuración base de un feature module: visibilidad de la funcionalidad. */
export interface FeatureModuleConfig {
  /** Si la funcionalidad transversal está activa para el negocio. */
  enabled: boolean;
}

// ─── Mapa completo ────────────────────────────────────────────────────────────

/**
 * Mapa completo de feature modules — paralelo a `PageModulesConfig`.
 * Cada key es un `FeatureModuleId`, cada valor es un `FeatureModuleConfig`.
 */
export type FeatureModulesConfig = Record<FeatureModuleId, FeatureModuleConfig>;
