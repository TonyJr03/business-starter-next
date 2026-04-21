/**
 * ContentFeature — ítem de un bloque de características / propuesta de valor.
 *
 * Diseñado para bloques tipo "¿Por qué elegirnos?" en la home o secciones
 * de valores. Compatible estructuralmente con FeatureItem del componente
 * FeatureSection.
 */
export interface ContentFeature {
  icon?: string;
  title: string;
  description: string;
}

/**
 * AboutContent — bloque de contenido narrativo para la página "Nosotros" / About.
 */
export interface AboutContent {
  /** Párrafos de la historia del negocio. */
  story: string[];
  /** Declaración de misión o propuesta de valor en una frase. */
  mission?: string;
  /** Diferenciadores clave del negocio. */
  differentiators?: ContentFeature[];
}

// ─── Contenido de módulos de página ──────────────────────────────────────────

/** Una entrada individual de FAQ con una pregunta y su respuesta. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Etiqueta de agrupación opcional (ej. "Pedidos", "Horarios"). */
  category?: string;
}

/** Una imagen individual en la galería. */
export interface GalleryItem {
  id: string;
  /** URL absoluta o ruta relativa a la raíz de la imagen. */
  src: string;
  /** Descripción accesible obligatoria de la imagen. */
  alt: string;
  /** Pie de foto opcional renderizado bajo la imagen. */
  caption?: string;
  /** Etiqueta de agrupación opcional (ej. "Espacio", "Productos"). */
  category?: string;
}

/** Un artículo de blog individual. */
export interface BlogPost {
  /** Identificador único seguro para URL usado para generar la ruta del artículo. */
  slug: string;
  title: string;
  /** Descripción de una oración mostrada en listados y etiquetas meta. */
  summary: string;
  /** Cuerpo del artículo renderizado como una lista ordenada de párrafos. */
  body: string[];
  /** Cadena de fecha ISO 8601 (YYYY-MM-DD). */
  publishedAt: string;
  author?: string;
  tags?: string[];
}
