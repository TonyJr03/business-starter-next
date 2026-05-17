import type { Product } from '../page-modules/catalog';

/** Ítem del carrito: producto + cantidad seleccionada. */
export interface CartItem {
  product: Product;
  quantity: number;
}
