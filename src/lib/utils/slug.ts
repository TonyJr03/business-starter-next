/**
 * Convierte un texto libre en un slug URL-safe.
 *
 * Ejemplos:
 *   'Café Cubano'   → 'cafe-cubano'
 *   'Menú del día'  → 'menu-del-dia'
 *   '2×1 en Tartas' → '2-1-en-tartas'
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ñ/g, 'n')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos (tildes, etc.)
    .replace(/[^a-z0-9]+/g, '-')    // no-alfanumérico → guion
    .replace(/^-|-$/g, '')          // elimina guiones extremos
}
