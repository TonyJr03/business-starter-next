import type { Testimonial } from '@/types';

/**
 * testimonials — reseñas y testimonios de clientes.
 *
 * Datos demo para la sección de testimonios del Home.
 * Ordenados por impacto para mostrar primero las más representativas.
 */
export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    authorName: 'María González',
    authorRole: 'Cliente habitual',
    quote:
      'El mejor café cubano del Vedado, sin duda. El ambiente es acogedor y el equipo siempre te recibe con una sonrisa. No podría empezar el día sin pasar por acá.',
    rating: 5,
  },
  {
    id: 'test-2',
    authorName: 'Carlos Rodríguez',
    authorRole: 'Vecino del barrio',
    quote:
      'Los pastelitos de guayaba son una maravilla. Siempre frescos y como los de antes. Recomendado al 100%.',
    rating: 5,
  },
  {
    id: 'test-3',
    authorName: 'Laura Martínez',
    authorRole: 'Visitante',
    quote:
      'Vine de visita a La Habana y alguien me recomendó este lugar. No me arrepiento para nada. El cortadito estaba perfecto y el trato fue excelente.',
    rating: 5,
  },
  {
    id: 'test-4',
    authorName: 'Roberto Peña',
    authorRole: 'Profesional independiente',
    quote:
      'Trabajo desde aquí casi todos los días. El WiFi es estable, el café es bueno y la tranquilidad del lugar me ayuda a concentrarme. Un hallazgo.',
    rating: 4,
  },
];
