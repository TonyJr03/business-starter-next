import type { ContentFeature } from '@/types';
import { globalConfig } from '@/config';

const { location } = globalConfig;

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
    title: location.city,
    description: `Encuéntranos${location.street ? ` en ${location.street}` : ''}${location.municipality ? `, ${location.municipality}` : ''}.`,
  },
  {
    icon: '🕐',
    title: 'Abierto toda la semana',
    description: 'Horario extendido para que disfrutes cuando lo necesites.',
  },
];
