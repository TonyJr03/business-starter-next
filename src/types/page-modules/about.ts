/** Un diferenciador clave del negocio (ítem de propuesta de valor). */
export interface ContentFeature {
  icon?: string;
  title: string;
  description: string;
}

/** Bloque de contenido narrativo para la página "Nosotros". Singleton por negocio. */
export interface AboutContent {
  id: string;
  /** Párrafos de la historia del negocio. */
  story: string[];
  /** Declaración de misión o propuesta de valor en una frase. */
  mission?: string;
  differentiators: ContentFeature[];
  /** URL de imagen del equipo o del local. */
  teamImageUrl?: string;
}
