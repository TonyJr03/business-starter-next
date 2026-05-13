/**
 * ════════════════════════════════════════════════════════════════════════════
 *  CONFIGURACIÓN GLOBAL DEL SISTEMA — DEFAULTS DE PLATAFORMA
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  Define los valores base que aplican a todos los tenants.
 *  Los datos operativos de cada negocio (nombre, contacto, horarios, etc.)
 *  viven en la tabla `businesses` de Supabase.
 *
 *  Bloques:
 *   · branding  → colores y tipografías por defecto (fallback si el tenant
 *                 no tiene branding propio en DB)
 *   · modules   → pages + sections + feature modules que definen la
 *                 estructura del starter; el tenant sobreescribe vía
 *                 BusinessModulesOverride en su fila de Supabase
 * ════════════════════════════════════════════════════════════════════════════
 */

import type { PlatformDefaults, PageModulesConfig, SectionModulesConfig, FeatureModulesConfig, BrandingConfig } from '@/types';

// ─── Page modules ────────────────────────────────────────────────────────────

const pageModules: PageModulesConfig = {
  catalog: {
    enabled:      true,
    path:         '/catalog',
    navLabel:     'Catálogo',
    title:        'Nuestro Catálogo',
    subtitle:     'Todo lo que tenemos para ofrecerte hoy.',
    featuredTitle: 'Destacados',
    emptyMessage: 'Sin productos en esta categoría por el momento.',
  },
  promotions: {
    enabled:      true,
    path:         '/promotions',
    navLabel:     'Promociones',
    title:        'Ofertas y Promociones',
    emptyMessage: 'Pronto tendremos novedades. ¡Vuelve a visitarnos!',
  },
  about: {
    enabled:  true,
    path:     '/about',
    navLabel: 'Nosotros',
    title:    'Sobre Nosotros',
    subtitle: 'Conoce la historia y los valores detrás de nuestro negocio.',
  },
  contact: {
    enabled:  true,
    path:     '/contact',
    navLabel: 'Contacto',
    title:    'Contáctanos',
    subtitle: 'Estamos disponibles para atenderte. La forma más rápida es por WhatsApp.',
  },
  faq: {
    enabled:  true,
    path:     '/faq',
    navLabel: 'FAQ',
    title:    'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber antes de visitarnos.',
    emptyMessage: 'Pronto publicaremos las preguntas frecuentes. Mientras tanto, escríbenos directamente.',
  },
  gallery: {
    enabled:  true,
    path:     '/gallery',
    navLabel: 'Galería',
    title:    'Galería',
    subtitle: 'Conoce nuestro espacio y nuestras creaciones.',
    emptyMessage: 'Pronto subiremos imágenes de nuestro espacio y productos.',
  },
  blog: {
    enabled:  true,
    path:     '/blog',
    navLabel: 'Blog',
    title:    'Blog',
    subtitle: 'Noticias, recetas y artículos de interés.',
    emptyMessage: 'No hay artículos publicados todavía.',
  },
};

// ─── Section modules ────────────────────────────────────────────────────────
// Props de contenido y layout base. El tenant puede sobreescribir cualquier campo
// de SectionModuleConfig (incluido layout) vía ModulesOverride en su fila de Supabase.

const sectionModules: SectionModulesConfig = {
  highlights: {
    enabled: true,
    order: 1,
    dependsOn: 'about',
    title: '¿Por qué elegirnos?',
    layout: { bg: 'surface', size: 'md', columns: 3 },
  },
  promotions: {
    enabled: true,
    order: 2,
    dependsOn: 'promotions',
    title: 'Ofertas especiales',
    layout: { bg: 'default', size: 'md' },
  },
  hours: {
    enabled: true,
    order: 3,
    dependsOn: 'business.hours',
    title: 'Horarios',
    layout: { bg: 'default', size: 'md' },
  },
  whatsapp_cta: {
    enabled: true,
    order: 4,
    dependsOn: 'business.whatsapp',
    title: '¿Listo para ordenar?',
    subtitle: 'Escríbenos directamente por WhatsApp y te atendemos al momento.',
    buttonLabel: 'Escribir ahora',
    message: 'Hola, me gustaría hacer una consulta.',
    layout: { bg: 'secondary', size: 'md' },
  },
  location: {
    enabled: true,
    order: 5,
    dependsOn: 'business.location',
    title: 'Dónde encontrarnos',
    layout: { bg: 'surface', size: 'md' },
  },
};

// ── Feature modules ───────────────────────────────────────────────────────────

const featureModules: FeatureModulesConfig = {
  cart:             { enabled: true },
  whatsappOrdering: { enabled: true },
};

// ── Branding ──────────────────────────────────────────────────────────────────
// Base visual de la plataforma. Todos los campos requeridos.
// El tenant sobreescribe parcialmente vía BrandingOverride (columna branding en la BD).

const branding: BrandingConfig = {
  themeKey: 'default',
  colors: {
    primary:         '#6F4E37',
    secondary:       '#F5E6D3',
    accent:          '#D4A574',
    footerBg:        '#111827',
    footerText:      '#FFFFFF',
    footerTextMuted: '#9CA3AF',
    footerBorder:    '#1F2937',
  },
  typography: {
    heading: "'Inter', system-ui, sans-serif",
    body:    "'Inter', system-ui, sans-serif",
  },
};

// ─── Config global ────────────────────────────────────────────────────────────

export const platformDefaults: PlatformDefaults = {
  branding,
  modules: {
    pages:    pageModules,
    sections: sectionModules,
    features: featureModules,
  },
};

