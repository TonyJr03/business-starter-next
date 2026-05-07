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

import type { BusinessGlobalConfig, PageModulesConfig, SectionModulesConfig, FeatureModulesConfig, BusinessBranding } from '@/types';

// ─── Page modules ────────────────────────────────────────────────────────────

const pageModules: PageModulesConfig = {
  catalog: {
    enabled:      true,
    path:         '/catalog',
    navLabel:     'Catálogo',
    title:        'Nuestro Catálogo',
    subtitle:     'Todo lo que tenemos para ofrecerte hoy.',
    featuredTitle: 'Destacados',
    cta: {
      title:       '¿Ves algo que te gusta?',
      subtitle:    'Escríbenos por WhatsApp y te atendemos de inmediato.',
      buttonLabel: 'Hacer un pedido',
      message:     'Hola, quisiera hacer un pedido.',
    },
  },
  promotions: {
    enabled:      true,
    path:         '/promotions',
    navLabel:     'Promociones',
    title:        'Ofertas y Promociones',
    emptyMessage: 'Pronto tendremos novedades. ¡Vuelve a visitarnos!',
    cta: {
      title:       '¿Tienes alguna consulta?',
      subtitle:    'Escríbenos por WhatsApp y te informamos sobre cualquier oferta.',
      buttonLabel: 'Consultar por WhatsApp',
      message:     'Hola, quisiera información sobre sus ofertas.',
    },
  },
  about: {
    enabled:  true,
    path:     '/about',
    navLabel: 'Nosotros',
    title:    'Sobre Nosotros',
    subtitle: 'Conoce la historia y los valores detrás de nuestro negocio.',
    cta: {
      title:       '¿Tienes alguna pregunta?',
      subtitle:    'Escríbenos directamente y te respondemos de inmediato.',
      buttonLabel: 'Escribir por WhatsApp',
      message:     'Hola, quisiera más información sobre el negocio.',
    },
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
    cta: {
      title:       '¿No encontraste lo que buscabas?',
      subtitle:    'Escríbenos directamente y te respondemos enseguida.',
      buttonLabel: 'Preguntar por WhatsApp',
      message:     'Hola, tengo una pregunta que no encontré en el FAQ.',
    },
  },
  gallery: {
    enabled:  true,
    path:     '/gallery',
    navLabel: 'Galería',
    title:    'Galería',
    subtitle: 'Conoce nuestro espacio y nuestras creaciones.',
  },
  blog: {
    enabled:  true,
    path:     '/blog',
    navLabel: 'Blog',
    title:    'Blog',
    subtitle: 'Noticias, recetas y artículos de interés.',
  },
};

// ─── Section modules ────────────────────────────────────────────────────────
// Props visuales genéricas. El tenant personaliza enabled/order desde el admin.

const sectionModules: SectionModulesConfig = {
  highlights: {
    enabled: true,
    order: 1,
    dependsOn: 'about',
    title: '¿Por qué elegirnos?',
    columns: 3,
    bg: 'surface',
    size: 'md',
  },
  promotions: {
    enabled: true,
    order: 2,
    dependsOn: 'promotions',
    title: 'Ofertas especiales',
    bg: 'default',
    size: 'md',
  },
  hours: {
    enabled: true,
    order: 3,
    dependsOn: 'business.hours',
    title: 'Horarios',
    bg: 'default',
    size: 'md',
  },
  whatsapp_cta: {
    enabled: true,
    order: 4,
    dependsOn: 'business.whatsapp',
    title: '¿Listo para ordenar?',
    subtitle: 'Escríbenos directamente por WhatsApp y te atendemos al momento.',
    buttonLabel: 'Escribir ahora',
    message: 'Hola, me gustaría hacer una consulta.',
    bg: 'secondary',
    size: 'md',
  },
  location: {
    enabled: true,
    order: 5,
    dependsOn: 'business.location',
    title: 'Dónde encontrarnos',
    bg: 'surface',
    size: 'md',
  },
};

// ── Feature modules ───────────────────────────────────────────────────────────

const featureModules: FeatureModulesConfig = {
  cart:             { enabled: false },
  whatsappOrdering: { enabled: false },
};

// ── Branding ──────────────────────────────────────────────────────────────────
// Fallback visual para tenants sin branding configurado en DB.

const branding: BusinessBranding = {
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

export const businessGlobalConfig: BusinessGlobalConfig = {
  branding,
  modules: {
    pages:    pageModules,
    sections: sectionModules,
    features: featureModules,
  },
};

