/**
 * ════════════════════════════════════════════════════════════════════════════
 *  CONFIGURACIÓN GLOBAL DEL NEGOCIO — FUENTE DE VERDAD ÚNICA
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  Para adaptar este starter a un nuevo negocio, edita ÚNICAMENTE este
 *  archivo. El resto del sistema lee todo desde `globalConfig`.
 *
 *  Bloques disponibles:
 *   · identity    → nombre, slug, tagline, descripción, logo
 *   · branding    → colores y tipografías de marca
 *   · contact     → WhatsApp, teléfono, email
 *   · location    → ciudad, país, calle, mapa
 *   · hours       → horarios por día de la semana
 *   · social      → redes sociales
 *   · modules     → feature flags + home sections + módulos secundarios
 *   · seoDefaults → plantilla de título y descripción meta
 * ════════════════════════════════════════════════════════════════════════════
 */

import { assertValidBusinessConfig, type BusinessGlobalConfig, type BusinessIdentity, type SectionModuleEntry, type PageModulesConfig } from '@/types';

// ─── Identity ────────────────────────────────────────────────────────────────
// Definida primero para poder referenciarla dentro de `homeSections`.

const identity: BusinessIdentity = {
  name: 'Café La Esquina',
  slug: 'cafe-la-esquina',
  tagline: 'El rincón del buen café habanero',
  description:
    'Café La Esquina es un rincón acogedor en el corazón de La Habana donde el aroma del café recién hecho te da la bienvenida. Ofrecemos los mejores cafés cubanos, bebidas artesanales y una selección de bocados para disfrutar en un ambiente tranquilo y familiar.',
  shortDescription:
    'Tu cafetería de confianza en La Habana. Café cubano, ambiente acogedor y los mejores sabores.',
  logo: {
    url: '/brands/cafe-la-esquina/logo/logo.svg',
    alt: 'Café La Esquina',
  },
  coverImageUrl: '/brands/cafe-la-esquina/hero/cover.svg',
};

// ─── Section modules ────────────────────────────────────────────────────────
// Las props que dependen de `identity` (nombre, tagline, descripción) se
// referencian aquí para evitar duplicación.

const sectionModules: SectionModuleEntry[] = [
  {
    id: 'hero',
    enabled: true,
    order: 1,
    props: {
      tagline: identity.tagline,
      title: identity.name,
      subtitle: identity.shortDescription,
      primaryCta: { label: 'Ver catálogo', href: '/catalog' },
      secondaryCta: { label: 'Contáctanos', href: '/contact' },
      bg: 'secondary',
      size: 'lg',
    },
  },
  {
    id: 'highlights',
    enabled: true,
    order: 2,
    props: {
      title: '¿Por qué elegirnos?',
      subtitle: identity.description,
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
      message: `Hola ${identity.name}, me gustaría hacer una consulta.`,
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
// Cada ruta del sitio (excepto Home) es un módulo activable.
// El orden de declaración determina el orden en la navegación.

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
      message:     `Hola ${identity.name}, quisiera hacer un pedido.`,
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
      message:     `Hola ${identity.name}, quisiera información sobre sus ofertas.`,
    },
  },
  about: {
    enabled:  true,
    path:     '/about',
    navLabel: 'Nosotros',
    title:    'Sobre Nosotros',
    subtitle: `Conoce la historia y los valores detrás de ${identity.name}.`,
    cta: {
      title:       '¿Tienes alguna pregunta?',
      subtitle:    'Escríbenos directamente y te respondemos de inmediato.',
      buttonLabel: 'Escribir por WhatsApp',
      message:     `Hola ${identity.name}, quisiera más información sobre el café.`,
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
      message:     `Hola ${identity.name}, tengo una pregunta que no encontré en el FAQ.`,
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

// ─── Config global ────────────────────────────────────────────────────────────

export const globalConfig: BusinessGlobalConfig = {
  // ── Identidad ─────────────────────────────────────────────────────────────
  identity,

  // ── Marca visual ──────────────────────────────────────────────────────────
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

  // ── Contacto ──────────────────────────────────────────────────────────────
  contact: {
    whatsapp: '+5350000000',
    phone:    '+5372000000',
    email:    'contacto@cafelaesquina.cu',
  },

  // ── Ubicación ─────────────────────────────────────────────────────────────
  location: {
    street:       'Calle 23 esquina a L, Vedado',
    municipality: 'Plaza de la Revolución',
    city:         'La Habana',
    country:      'Cuba',
  },

  // ── Horarios ──────────────────────────────────────────────────────────────
  hours: [
    { day: 'Lunes',     open: '08:00', close: '22:00', isClosed: false },
    { day: 'Martes',    open: '08:00', close: '22:00', isClosed: false },
    { day: 'Miércoles', open: '08:00', close: '22:00', isClosed: false },
    { day: 'Jueves',    open: '08:00', close: '22:00', isClosed: false },
    { day: 'Viernes',   open: '08:00', close: '22:00', isClosed: false },
    { day: 'Sábado',    open: '08:00', close: '22:00', isClosed: false },
    { day: 'Domingo',   open: '09:00', close: '18:00', isClosed: false },
  ],

  // ── Redes sociales ────────────────────────────────────────────────────────
  social: {
    instagram: 'https://instagram.com/cafelaesquina',
    facebook:  'https://facebook.com/cafelaesquina',
  },

  // ── Módulos ───────────────────────────────────────────────────────────────
  modules: {
    // Módulos de página — cada ruta del sitio (excepto Home) es un módulo activable.
    pages: pageModules,

    // Secciones de la home: orden, visibilidad y props visuales
    sections: sectionModules,

    // Feature modules funcionales (no tienen página propia)
    features: {
      cart:             { enabled: false },
      whatsappOrdering: { enabled: false },
    },
  },

  // ── SEO ───────────────────────────────────────────────────────────────────
  seoDefaults: {
    titleTemplate:      `%s | ${identity.name}`,
    defaultDescription: identity.shortDescription ?? identity.description,
    ogImage:            identity.coverImageUrl,
  },
};

// ─── Validación de arranque ───────────────────────────────────────────────────
// Se ejecuta al cargar el módulo (una sola vez por proceso / build worker).
// Si globalConfig está mal formada, el build o el servidor fallan de inmediato
// con un listado claro de errores — nunca de forma silenciosa.
assertValidBusinessConfig(globalConfig);
