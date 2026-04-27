// ─── CTA copy ────────────────────────────────────────────────────────────────

/** Bloque de textos para una sección CTA de WhatsApp dentro de una página. */
export interface PageCtaCopy {
  title: string;
  subtitle?: string;
  buttonLabel: string;
  /** Mensaje pre-escrito enviado al abrir WhatsApp. */
  message: string;
}

// ─── IDs de Módulos de Página ──────────────────────────────────────────────────

/**
 * Unión de todos los identificadores de módulos de página activables.
 * Home NO está aquí — es la única ruta fija del sistema.
 */
export type PageModuleId =
  | 'catalog'
  | 'promotions'
  | 'about'
  | 'contact'
  | 'faq'
  | 'gallery'
  | 'blog';

// ─── Configuración por módulo ──────────────────────────────────────────────────

/** Configuración compartida por cada módulo de página. */
export interface PageModuleConfig {
  /** Si este módulo está activo y debe ser renderizado. */
  enabled: boolean;
  /** Ruta de la página (ej. '/catalog'). */
  path: string;
  /** Label en el menú de navegación principal. */
  navLabel: string;
  /** Encabezado H1 de la página (opcional). */
  title?: string;
  /** Texto descriptivo bajo el H1 (opcional). */
  subtitle?: string;
  /** Título de la sección de elementos destacados (usado por catalog). */
  featuredTitle?: string;
  /** Mensaje mostrado cuando no hay contenido (usado por promotions, blog, gallery). */
  emptyMessage?: string;
  /** Bloque CTA de WhatsApp al final de la página (opcional). */
  cta?: PageCtaCopy;
}

// ─── Mapa completo ────────────────────────────────────────────────────────────

/**
 * Registro de cada módulo de página, indexado por PageModuleId.
 * Type-safe: añadir un nuevo ID a la unión fuerza una entrada correspondiente aquí.
 */
export type PageModulesConfig = Record<PageModuleId, PageModuleConfig>;
