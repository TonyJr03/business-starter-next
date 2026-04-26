// ─── Base ────────────────────────────────────────────────────────────────────

interface SectionBase {
  /** Si esta sección se renderiza en la Home. */
  enabled: boolean;
  /** Orden de renderizado ascendente (1 = arriba del todo). */
  order: number;
}

// ─── Per-section props ────────────────────────────────────────────────────────

export interface HeroSectionProps {
  title: string;
  tagline?: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: 'center' | 'left';
  bg?: 'secondary' | 'primary' | 'surface' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

/** Solo props visuales — los ítems de características se inyectan en tiempo de render desde data/. */
export interface HighlightsSectionProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  bg?: 'default' | 'surface' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/** Reservada — componente aún no implementado. */
export interface PromotionsSectionProps {
  title?: string;
  subtitle?: string;
  bg?: 'default' | 'surface' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/** Reservada — componente aún no implementado. */
export interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  bg?: 'default' | 'surface' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * @note Este tipo vive temporalmente en section-modules.ts porque el id 'whatsapp_cta'
 * forma parte de SectionModuleEntry (se puede configurar como sección del home).
 * En S2 se moverá a un contrato de feature modules, dejando aquí solo una referencia.
 */
export interface WhatsappCtaSectionProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  /** Mensaje pre-cargado en WhatsApp. Se interpola al definir la config. */
  message?: string;
  bg?: 'default' | 'surface' | 'secondary' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

/** Reservada — componente aún no implementado. */
export interface LocationSectionProps {
  title?: string;
  bg?: 'default' | 'surface' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/** Solo props visuales — el array openingHours se inyecta desde businessConfig en tiempo de render. */
export interface HoursSectionProps {
  title?: string;
  bg?: 'default' | 'surface' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

// ─── Discriminated union ──────────────────────────────────────────────────────

/**
 * Entrada de módulo de sección: identidad, visibilidad, orden y props visuales.
 * El campo `id` es el discriminante — TypeScript estrecha `props` automáticamente.
 */
export type SectionModuleEntry =
  | (SectionBase & { id: 'hero';         props: HeroSectionProps })
  | (SectionBase & { id: 'highlights';   props: HighlightsSectionProps })
  | (SectionBase & { id: 'promotions';   props: PromotionsSectionProps })
  | (SectionBase & { id: 'testimonials'; props: TestimonialsSectionProps })
  | (SectionBase & { id: 'whatsapp_cta'; props: WhatsappCtaSectionProps })
  | (SectionBase & { id: 'location';     props: LocationSectionProps })
  | (SectionBase & { id: 'hours';        props: HoursSectionProps });

/** Unión de todos los IDs de sección válidos — derivada del tipo, nunca duplicada. */
export type SectionModuleId = SectionModuleEntry['id'];
