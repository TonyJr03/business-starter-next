import type { Product } from '@/types';

/**
 * products — productos del catálogo del negocio.
 *
 * Fuente canónica de datos de productos.
 * Cada producto usa `money` (valor estructurado con divisa ISO 4217)
 * como campo canónico de precio.
 *
 * Los servicios de productos consumen este array a través del barrel @/data.
 */
export const products: Product[] = [
  // ── Cafés (cat-1) ────────────────────────────────────────────────────────
  {
    id: 'prod-1',
    categoryId: 'cat-1',
    name: 'Café Cubano',
    slug: 'cafe-cubano',
    description: 'Nuestro café cubano tradicional, fuerte y aromático.',
    money: { amount: 25, currency: 'CUP' },
    isAvailable: true,
    isFeatured: true,
    badge: 'popular',
    sortOrder: 1,
  },
  {
    id: 'prod-2',
    categoryId: 'cat-1',
    name: 'Cortadito',
    slug: 'cortadito',
    description: 'Café cubano con un toque de leche suave.',
    money: { amount: 30, currency: 'CUP' },
    isAvailable: true,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    id: 'prod-3',
    categoryId: 'cat-1',
    name: 'Café con Leche',
    slug: 'cafe-con-leche',
    description: 'La combinación perfecta para comenzar el día.',
    money: { amount: 40, currency: 'CUP' },
    isAvailable: true,
    isFeatured: false,
    sortOrder: 3,
  },
  {
    id: 'prod-4',
    categoryId: 'cat-1',
    name: 'Espresso Doble',
    slug: 'espresso-doble',
    description: 'Concentrado e intenso, para los que no se conforman con poco.',
    money: { amount: 45, currency: 'CUP' },
    isAvailable: true,
    isFeatured: false,
    badge: 'new',
    sortOrder: 4,
  },
  // ── Bebidas frías (cat-2) ─────────────────────────────────────────────────
  {
    id: 'prod-5',
    categoryId: 'cat-2',
    name: 'Jugo de Guayaba',
    slug: 'jugo-guayaba',
    description: 'Natural, fresco y bien cubano.',
    money: { amount: 35, currency: 'CUP' },
    isAvailable: true,
    isFeatured: true,
    badge: 'new',
    sortOrder: 1,
  },
  {
    id: 'prod-6',
    categoryId: 'cat-2',
    name: 'Batido de Mango',
    slug: 'batido-mango',
    description: 'Cremoso y dulce, hecho con mango fresco.',
    money: { amount: 50, currency: 'CUP' },
    isAvailable: true,
    isFeatured: false,
    sortOrder: 2,
  },
  {
    id: 'prod-7',
    categoryId: 'cat-2',
    name: 'Agua de Coco',
    slug: 'agua-de-coco',
    description: 'Refrescante y natural, directo del coco.',
    money: { amount: 40, currency: 'CUP' },
    isAvailable: true,
    isFeatured: false,
    sortOrder: 3,
  },
  // ── Bocados (cat-3) ───────────────────────────────────────────────────────
  {
    id: 'prod-8',
    categoryId: 'cat-3',
    name: 'Pastelito de Guayaba',
    slug: 'pastelito-guayaba',
    description: 'Hojaldrado y relleno de guayaba, igual que en casa.',
    money: { amount: 20, currency: 'CUP' },
    isAvailable: true,
    isFeatured: true,
    badge: 'popular',
    sortOrder: 1,
  },
  {
    id: 'prod-9',
    categoryId: 'cat-3',
    name: 'Tostada con Mantequilla',
    slug: 'tostada-mantequilla',
    description: 'Pan tostado, crujiente y bien untado.',
    money: { amount: 15, currency: 'CUP' },
    isAvailable: false,
    isFeatured: false,
    sortOrder: 2,
  },
  {
    id: 'prod-10',
    categoryId: 'cat-3',
    name: 'Croqueta de Jamón',
    slug: 'croqueta-jamon',
    description: 'Crujiente por fuera, cremosa por dentro. Perfecta para acompañar el café.',
    money: { amount: 25, currency: 'CUP' },
    isAvailable: true,
    isFeatured: false,
    sortOrder: 3,
  },
];
