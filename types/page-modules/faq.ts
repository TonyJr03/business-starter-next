/** Una entrada individual de preguntas frecuentes. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Etiqueta de agrupación opcional (ej. "Pedidos", "Horarios"). */
  category?: string;
  /** Posición en el listado (menor = primero). */
  sortOrder?: number;
  /** Controla la visibilidad; se asume true si se omite. */
  isActive?: boolean;
}
