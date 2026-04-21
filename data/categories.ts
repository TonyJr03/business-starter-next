import type { Category } from '@/types';

/**
 * categories — categorías del menú / catálogo del negocio.
 *
 * Fuente canónica de datos para categorías.
 * Los servicios de productos consumen este array a través del barrel @/data.
 */
export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Cafés',
    slug: 'cafes',
    description: 'Café cubano, espresso, americano y más.',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Bebidas frías',
    slug: 'bebidas-frias',
    description: 'Jugos, batidos y refrescos naturales.',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Bocados',
    slug: 'bocados',
    description: 'Pastelitos, snacks y algo para acompañar.',
    sortOrder: 3,
    isActive: true,
  },
];
