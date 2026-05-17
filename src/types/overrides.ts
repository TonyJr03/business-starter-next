import type { PageModuleId, PageModuleConfig } from './page-modules';
import type { SectionModuleId, SectionModuleConfig } from './section-modules';
import type { FeatureModuleId, FeatureModuleConfig } from './feature-modules';
import type { BrandingColors, BrandingTypography } from './branding';
// BrandingConfig (types/branding.ts) es la base completa; BrandingOverride es su override parcial.

// ─── Branding override ────────────────────────────────────────────────────────

/**
 * Override parcial del branding de un tenant.
 * Solo los campos presentes sobreescriben el `PlatformBranding` base.
 * Almacenado en la columna `branding JSONB` de la tabla `businesses`.
 *
 * Estrategia de merge en `resolveBrandVars()`:
 *   colors:     { ...base.colors,     ...override.colors     }
 *   typography: { ...base.typography, ...override.typography }
 */
export interface BrandingOverride {
  /** Clave de tema predefinido. Sobreescribe el themeKey de la plataforma. */
  themeKey?: string;
  /** Colores parciales. Solo los campos presentes sobreescriben la base. */
  colors?: Partial<BrandingColors>;
  /** Tipografías parciales. Solo los campos presentes sobreescriben la base. */
  typography?: Partial<BrandingTypography>;
}

// ─── Modules override ─────────────────────────────────────────────────────────

/**
 * Override parcial de la configuración modular de un negocio.
 *
 * Cada campo es opcional: un tenant puede sobreescribir solo las partes
 * que necesita; el resto se obtiene de `platformDefaults.modules` como fallback.
 *
 * Estrategia de merge en `resolveModules()`:
 *   - pages:    por clave — `{ ...base[id], ...override[id] }`
 *   - sections: por id   — shallow merge de SectionModuleConfig +
 *               deep-merge de `layout` (bg/size/columns);
 *               `dependsOn` nunca se sobreescribe (es de plataforma)
 *   - features: por clave — `{ ...base[id], ...override[id] }`
 */
export interface ModulesOverride {
  /** Overrides parciales de page modules. Solo las claves presentes sobreescriben la base. */
  pages?: Partial<Record<PageModuleId, Partial<PageModuleConfig>>>;
  /** Overrides de secciones de la home. Mismo patrón que pages y features. */
  sections?: Partial<Record<SectionModuleId, Partial<SectionModuleConfig>>>;
  /** Overrides parciales de feature modules. Solo las claves presentes sobreescriben la base. */
  features?: Partial<Record<FeatureModuleId, Partial<FeatureModuleConfig>>>;
}
