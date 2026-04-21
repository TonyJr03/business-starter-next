/**
 * Testimonial — reseña o testimonio de un cliente.
 *
 * Tipo neutral: aplica a cualquier tipo de negocio local.
 */
export interface Testimonial {
  id: string;
  authorName: string;
  /** Rol, ocupación o descripción breve del autor (opcional). */
  authorRole?: string;
  avatarUrl?: string;
  quote: string;
  /** Puntuación de 1 a 5 (opcional). */
  rating?: number;
}
