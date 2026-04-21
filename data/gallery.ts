import type { GalleryItem } from '@/types';

/**
 * galleryItems — imágenes de la galería (demo).
 *
 * Usa imágenes de Picsum Photos como placeholder.
 * Reemplaza `src` con las rutas reales (ej. `/brands/cafe-la-esquina/gallery/espacio-01.webp`)
 * y actualiza `alt` y `caption` con descripciones reales del negocio.
 *
 * Dimensiones recomendadas para producción: 800×600 px (landscape).
 */
export const galleryItems: GalleryItem[] = [
  // ── Espacio ──────────────────────────────────────────────────────────────
  {
    id: 'gal-1',
    src: 'https://picsum.photos/seed/cafe-interior/800/600',
    alt: 'Interior acogedor del café con mesas de madera y luz natural',
    caption: 'Nuestro salón principal',
    category: 'Espacio',
  },
  {
    id: 'gal-2',
    src: 'https://picsum.photos/seed/cafe-barra/800/600',
    alt: 'Barra de cafetería con máquina espresso y vitrina de pastelería',
    caption: 'La barra, el corazón del café',
    category: 'Espacio',
  },
  {
    id: 'gal-3',
    src: 'https://picsum.photos/seed/cafe-terraza/800/600',
    alt: 'Terraza exterior con plantas y sillas coloridas',
    caption: 'Terraza al aire libre',
    category: 'Espacio',
  },

  // ── Productos ─────────────────────────────────────────────────────────────
  {
    id: 'gal-4',
    src: 'https://picsum.photos/seed/cafe-cortadito/800/600',
    alt: 'Cortadito cubano servido en taza pequeña sobre platillo de cerámica',
    caption: 'Cortadito cubano',
    category: 'Productos',
  },
  {
    id: 'gal-5',
    src: 'https://picsum.photos/seed/cafe-pastelitos/800/600',
    alt: 'Bandeja de pastelitos de guayaba recién horneados',
    caption: 'Pastelitos de guayaba',
    category: 'Productos',
  },
  {
    id: 'gal-6',
    src: 'https://picsum.photos/seed/cafe-batido/800/600',
    alt: 'Batido tropical de mango con pajilla y rodaja de fruta',
    caption: 'Batidos tropicales',
    category: 'Productos',
  },

  // ── Equipo ────────────────────────────────────────────────────────────────
  {
    id: 'gal-7',
    src: 'https://picsum.photos/seed/cafe-barista/800/600',
    alt: 'Barista preparando café con dedicación detrás del mostrador',
    caption: 'Nuestro equipo, siempre con dedicación',
    category: 'Equipo',
  },
  {
    id: 'gal-8',
    src: 'https://picsum.photos/seed/cafe-clientes/800/600',
    alt: 'Clientes disfrutando de una tarde en el café',
    caption: 'Un espacio para compartir',
    category: 'Equipo',
  },
];
