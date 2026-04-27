import type { ContentFeature } from '@/types';

/**
 * highlightItems — ítems editoriales para la sección "highlights" de la Home.
 *
 * Representa la propuesta de valor del negocio.
 * Los datos estructurales (ciudad, calle) se leen de globalConfig para
 * evitar duplicación.
 *
 * Personaliza estos ítems para cada cliente.
 */
export const highlightItems: ContentFeature[] = [
  {
    icon: '✨',
    title: 'Calidad artesanal',
    description:
      'Cada producto elaborado con los mejores ingredientes locales y con el cuidado de siempre.',
  },
  {
    icon: '📍',
    title: 'Ubicación conveniente',
    description: 'Encuéntranos en una ubicación accesible y céntrica.',
  },
  {
    icon: '🕐',
    title: 'Abierto toda la semana',
    description: 'Horario extendido para que disfrutes cuando lo necesites.',
  },
];
