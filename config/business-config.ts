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

import { assertValidBusinessConfig, type BusinessGlobalConfig, type SectionModuleEntry, type PageModulesConfig } from '@/types';

// ─── Section modules ────────────────────────────────────────────────────────
// Props visuales genéricas. El tenant personaliza los textos desde el admin.

const sectionModules: SectionModuleEntry[] = [
  {
    id: 'hero',
    enabled: true,
    order: 1,
    props: {
      tagline: '',
      title: '',
      subtitle: '',
      primaryCta: { label: 'Ver catálogo', href: '/catalog' },
      secondaryCta: { label: 'Contáctanos', href: '/contact' },
      bg: 'secondary',
      size: 'lg',
    },
  },
  {
    id: 'highlights',
    enabled: false,
    order: 2,
    props: {
      title: '¿Por qué elegirnos?',
      subtitle: '',
      columns: 3,
      bg: 'surface',
      size: 'md',
    },
  },
  {
    id: 'promotions',
    enabled: false,
    order: 3,
    props: {
      title: 'Ofertas especiales',
      bg: 'default',
      size: 'md',
    },
  },
  {
    id: 'testimonials',
    enabled: false,
    order: 4,
    props: {
      title: 'Lo que dicen nuestros clientes',
      bg: 'surface',
      size: 'md',
    },
  },
  {
    id: 'hours',
    enabled: true,
    order: 5,
    props: {
      title: 'Horarios',
      bg: 'default',
      size: 'md',
    },
  },
  {
    id: 'whatsapp_cta',
    enabled: true,
    order: 6,
    props: {
      title: '¿Listo para ordenar?',
      subtitle: 'Escríbenos directamente por WhatsApp y te atendemos al momento.',
      buttonLabel: 'Escribir ahora',
      message: 'Hola, me gustaría hacer una consulta.',
      bg: 'secondary',
      size: 'md',
    },
  },
  {
    id: 'location',
    enabled: false,
    order: 7,
    props: {
      title: 'Dónde encontrarnos',
      bg: 'surface',
      size: 'md',
    },
  },
];

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
    enabled:  false,
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
    enabled:  false,
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
    enabled:  false,
    path:     '/gallery',
    navLabel: 'Galería',
    title:    'Galería',
    subtitle: 'Conoce nuestro espacio y nuestras creaciones.',
  },
  blog: {
    enabled:  false,
    path:     '/blog',
    navLabel: 'Blog',
    title:    'Blog',
    subtitle: 'Noticias, recetas y artículos de interés.',
  },
};

// ─── Config global ────────────────────────────────────────────────────────────

export const businessGlobalConfig: BusinessGlobalConfig = {
  // ── Branding por defecto ──────────────────────────────────────────────────
  // Fallback visual para tenants sin branding configurado en DB.
  branding: {
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
  },

  // ── Módulos ───────────────────────────────────────────────────────────────
  modules: {
    pages:    pageModules,
    sections: sectionModules,
    features: {
      cart:             { enabled: false },
      whatsappOrdering: { enabled: false },
    },
  },
};

// ─── Validación de arranque ───────────────────────────────────────────────────
assertValidBusinessConfig(businessGlobalConfig);
