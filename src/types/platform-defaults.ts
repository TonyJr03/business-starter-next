import type { SectionModulesConfig } from './section-modules';
import type { PageModulesConfig } from './page-modules';
import type { FeatureModulesConfig } from './feature-modules';
import type { BrandingConfig } from './branding';

// ─── Modules ──────────────────────────────────────────────────────────────────

export interface ModulesConfig {
  /** Módulos de página activables — cada uno con su ruta, label y config. */
  pages: PageModulesConfig;
  /** Secciones de la página de inicio, indexadas por SectionModuleId. Orden, visibilidad y props visuales de cada sección. */
  sections: SectionModulesConfig;
  /** Feature modules funcionales — cada feature tiene su propio `{ enabled }`. */
  features: FeatureModulesConfig;
}

// ─── Root Contract ─────────────────────────────────────────────────────────────

/**
 * Defaults de plataforma — valores base que aplican a todos los tenants.
 *
 * | bloque    | responsabilidad                                               |
 * |-----------|---------------------------------------------------------------|
 * | `branding`| branding completo (base para el merge con `BrandingOverride`  |
 * |           | del tenant almacenado en DB)                                  |
 * | `modules` | módulos de página + secciones home + feature modules.         |
 *           | El tenant sobreescribe partes vía `ModulesOverride`   |
 *
 * Los datos operativos de cada negocio (identity, contact, location,
 * hours, social) viven en la tabla `businesses` de Supabase, no aquí.
 */
export interface PlatformDefaults {
  branding: BrandingConfig;
  modules: ModulesConfig;
}
