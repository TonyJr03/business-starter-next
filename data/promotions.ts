import type { Promotion } from '@/types';

/**
 * promotions — promociones y ofertas especiales del negocio.
 *
 * Fuente canónica de datos de promociones.
 * Cada promoción declara `status` explícito y `rules` tipadas.
 * La función `resolvePromotionStatus()` del servicio puede derivar el estado
 * automáticamente cuando `status` se omite, usando startsAt/endsAt.
 *
 * Los servicios de promociones consumen este array a través del barrel @/data.
 */
export const promotions: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Desayuno Completo',
    description:
      'Café cubano + tostada + jugo del día por un precio especial. Disponible de lunes a viernes de 8:00 a 11:00.',
    discountLabel: '20% OFF',
    status: 'active',
    startsAt: '2026-04-01',
    endsAt: '2026-04-30',
    rules: [
      {
        type: 'percentage',
        value: 20,
        description: 'Descuento del 20% en el combo de desayuno completo.',
      },
    ],
  },
  {
    id: 'promo-2',
    title: 'Happy Hour del Café',
    description: 'Todos los cafés a mitad de precio de 3:00 PM a 5:00 PM.',
    discountLabel: '50% OFF',
    status: 'active',
    startsAt: '2026-04-01',
    endsAt: '2026-04-30',
    categoryIds: ['cat-1'],
    rules: [
      {
        type: 'percentage',
        value: 50,
        categoryIds: ['cat-1'],
        description: 'Mitad de precio en todos los cafés durante happy hour.',
      },
    ],
  },
  {
    id: 'promo-3',
    title: 'Combo Amigos',
    description:
      'Dos cafés cubanos + dos pastelitos de guayaba por un precio especial. Ideal para compartir.',
    discountLabel: 'Combo',
    status: 'active',
    productIds: ['prod-1', 'prod-8'],
    rules: [
      {
        type: 'combo',
        minItems: 4,
        productIds: ['prod-1', 'prod-8'],
        description: 'Precio especial al pedir 2 cafés cubanos y 2 pastelitos de guayaba.',
      },
    ],
  },
  {
    id: 'promo-4',
    title: 'Tarde de Batidos',
    description:
      'Lleva dos batidos y paga uno. De 2:00 PM a 6:00 PM, de martes a jueves.',
    discountLabel: '2×1',
    status: 'paused',
    startsAt: '2026-04-15',
    endsAt: '2026-05-15',
    categoryIds: ['cat-2'],
    rules: [
      {
        type: 'bogo',
        minItems: 2,
        categoryIds: ['cat-2'],
        description: 'Segundo batido gratis al comprar el primero en el horario indicado.',
      },
    ],
  },
];
