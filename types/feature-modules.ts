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

// ─── Feature Modules Config ───────────────────────────────────────────────────

/**
 * Mapa completo de feature modules — paralelo a `PageModulesConfig`.
 * Cada key es un `FeatureModuleId`, cada valor es un `FeatureModuleConfig`.
 */
export type FeatureModulesConfig = Record<FeatureModuleId, FeatureModuleConfig>;

// ─── WhatsApp CTA Props ───────────────────────────────────────────────────────

/**
 * Props visuales del componente `CtaWhatsappSection`.
 *
 * Este tipo vive en feature-modules porque el componente es una funcionalidad
 * transversal: se usa tanto como sección del home (vía SectionRenderer)
 * como bloque reutilizable dentro de páginas (catalog, about, faq, promotions).
 *
 * `section-modules.ts` lo re-exporta para mantener compatibilidad
 * con `SectionModuleEntry { id: 'whatsapp_cta', props: WhatsappCtaSectionProps }`.
 */
export interface WhatsappCtaSectionProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  /** Número de WhatsApp del negocio en formato E.164. Si se omite, el componente usa globalConfig como fallback. */
  phoneNumber?: string;
  /** Mensaje pre-cargado en WhatsApp. Se interpola al definir la config. */
  message?: string;
  bg?: 'default' | 'surface' | 'secondary' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}
