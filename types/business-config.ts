import type { SectionModuleEntry } from './section-modules';
import type { PageModulesConfig } from './page-modules';
import type { FeatureModulesConfig } from './feature-modules';
import type { BusinessBranding } from './business';

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

// ─── Validación en tiempo de ejecución ────────────────────────────────────────

/** Mensaje de error de validación estructural. */
export type ConfigValidationError = string;

/**
 * Valida la estructura básica de `BusinessGlobalConfig`.
 * Comprueba que los módulos requeridos estén presentes.
 *
 * @returns Array de mensajes de error. Array vacío indica config válida.
 */
export function validateBusinessConfig(
  config: BusinessGlobalConfig,
): ConfigValidationError[] {
  const errors: ConfigValidationError[] = [];

  if (!config.modules?.pages) {
    errors.push('modules.pages es obligatorio.');
  }
  if (!Array.isArray(config.modules?.sections)) {
    errors.push('modules.sections debe ser un array.');
  }

  return errors;
}

/**
 * Lanza un error descriptivo si `BusinessGlobalConfig` contiene problemas estructurales.
 *
 * @throws {Error} Con el listado completo de errores encontrados.
 */
export function assertValidBusinessConfig(config: BusinessGlobalConfig): void {
  const errors = validateBusinessConfig(config);
  if (errors.length > 0) {
    throw new Error(
      `BusinessGlobalConfig inválida:\n${errors.map((e) => `  • ${e}`).join('\n')}`,
    );
  }
}
