import type { BusinessBranding, BusinessSocial, DayHours } from './business-config';

// ─── Settings del negocio (desde DB) ─────────────────────────────────────────

/**
 * Datos operativos del negocio leídos desde la tabla `businesses`.
 * Refleja los campos editables desde el panel admin.
 * Branding, módulos y navegación viven en `config/` (código, no datos).
 */
export interface BusinessSettings {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  social?: BusinessSocial;
  hours?: DayHours[];
  /** Branding visual del tenant. Si es undefined, el layout usa globalConfig.branding como fallback. */
  branding?: BusinessBranding;
}

// ─── Directorio público de negocios ──────────────────────────────────────────

/**
 * Subconjunto ligero de BusinessSettings para el listado en la plataforma.
 * Solo los campos necesarios para renderizar una BusinessCard.
 */
export interface BusinessDirectoryItem {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  city?: string;
}
