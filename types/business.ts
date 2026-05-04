import type { BusinessBranding } from './branding';
import type { BusinessModulesOverride } from './overrides';

// ─── Logo ─────────────────────────────────────────────────────────────────────

export interface BusinessLogo {
  /** Ruta relativa o URL absoluta de la imagen del logo. */
  url: string;
  /** Texto alternativo accesible. */
  alt: string;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface BusinessContact {
  /** Número de WhatsApp con código de país en formato E.164 (ej. '+5350000000'). */
  whatsapp?: string;
  phone?: string;
  email?: string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface BusinessLocation {
  /** Dirección postal legible (calle, municipio). */
  address?: string;
  /** Ciudad donde opera el negocio. */
  city?: string;
  /** País donde opera el negocio. */
  country?: string;
  /** Calle y número / esquina. */
  street?: string;
  /** Municipio o barrio. */
  municipality?: string;
  /** URL de embed de Google Maps u otro proveedor. */
  mapUrl?: string;
  /** Coordenadas geográficas para integraciones de mapa. */
  coordinates?: GeoCoordinates;
}

// ─── Hours ────────────────────────────────────────────────────────────────────

export interface DayHours {
  /** Nombre del día en el idioma del negocio (ej. 'Lunes'). */
  day: string;
  /** Hora de apertura en formato HH:MM. Se ignora si `isClosed` es true. */
  open: string;
  /** Hora de cierre en formato HH:MM. Se ignora si `isClosed` es true. */
  close: string;
  /** Marca el día como cerrado. */
  isClosed: boolean;
}

// ─── Social ───────────────────────────────────────────────────────────────────

export interface BusinessSocial {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  telegram?: string;
  youtube?: string;
  /** Permite declarar plataformas adicionales sin romper el tipo base. */
  [platform: string]: string | undefined;
}

// ─── Settings del negocio (desde DB) ─────────────────────────────────────────

/**
 * Datos operativos del negocio leídos desde la tabla `businesses`.
 * Refleja los campos editables desde el panel admin.
 */
export interface BusinessSettings {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  contact?: BusinessContact;
  location?: BusinessLocation;
  logo?: BusinessLogo;
  social?: BusinessSocial;
  hours?: DayHours[];
  isActive: boolean;
  branding?: BusinessBranding;
  modules?: BusinessModulesOverride;
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
