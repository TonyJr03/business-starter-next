import type { SectionModuleEntry } from './section-modules';
import type { PageModulesConfig } from './page-modules';
import type { FeatureModulesConfig } from './feature-modules';
import type { BusinessBranding } from './branding';

// ─── Modules ──────────────────────────────────────────────────────────────────

export interface BusinessModulesConfig {
  /** Módulos de página activables — cada uno con su ruta, label y config. */
  pages: PageModulesConfig;
  /**
   * Secciones de la página de inicio:
   * orden, visibilidad y props visuales de cada sección.
   */
  sections: SectionModuleEntry[];
  /** Feature modules funcionales — cada feature tiene su propio `{ enabled }`. */
  features: FeatureModulesConfig;
}

// ─── Root Contract ─────────────────────────────────────────────────────────────

/**
 * Configuración global de plataforma — defaults que aplican a todos los tenants.
 *
 * | bloque    | responsabilidad                                               |
 * |-----------|---------------------------------------------------------------|
 * | `branding`| colores y tipografías por defecto (fallback si el tenant      |
 * |           | no tiene branding propio en DB)                               |
 * | `modules` | módulos de página + secciones home + feature modules.         |
 * |           | El tenant puede sobreescribir partes vía `BusinessModulesOverride` |
 *
 * Los datos operativos de cada negocio (identity, contact, location,
 * hours, social) viven en la tabla `businesses` de Supabase, no aquí.
 */
export interface BusinessGlobalConfig {
  branding: BusinessBranding;
  modules: BusinessModulesConfig;
}
