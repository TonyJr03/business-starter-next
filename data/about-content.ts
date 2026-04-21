import type { AboutContent } from '@/types';

/**
 * aboutContent — contenido editorial/narrativo para la página About ("Nosotros").
 *
 * Este archivo contiene únicamente texto de marca: historia, misión y
 * diferenciadores. No duplica datos estructurales que viven en globalConfig
 * (nombre, contacto, ubicación, horarios).
 *
 * Personaliza estos textos para cada cliente.
 */
export const aboutContent: AboutContent = {
  story: [
    'Café La Esquina nació en 2018 de la mano de dos amigos habaneros con un sueño sencillo: crear un espacio donde el café de verdad tuviera el protagonismo que merece. Lo que empezó como un pequeño local en el Vedado se convirtió rápidamente en el punto de encuentro favorito del barrio.',
    'Trabajamos con granos de café cubano de primera calidad, tostados de forma artesanal para preservar cada matiz de sabor. Nuestro equipo está formado por personas apasionadas por la buena atención y el ambiente tranquilo, donde cada visita se siente como en casa.',
    'Hoy seguimos fieles a esa misma filosofía: café de calidad, trato cercano y un rincón acogedor en el corazón de La Habana.',
  ],

  mission:
    'Ser el rincón de referencia en La Habana donde cada taza de café es una experiencia: auténtica, artesanal y llena de calidez.',

  differentiators: [
    {
      icon: '☕',
      title: 'Café cubano de verdad',
      description:
        'Granos locales seleccionados, tostado artesanal y recetas tradicionales que respetan el sabor de siempre.',
    },
    {
      icon: '🤝',
      title: 'Trato cercano',
      description:
        'Cada cliente es un vecino. Nos tomamos el tiempo de conocerte y ofrecerte exactamente lo que necesitas.',
    },
    {
      icon: '🌿',
      title: 'Ingredientes naturales',
      description:
        'Sin artificiales. Jugos recién exprimidos, batidos con frutas de temporada y bocados hechos en casa.',
    },
    {
      icon: '🏡',
      title: 'Ambiente acogedor',
      description:
        'Un espacio tranquilo para trabajar, conversar o simplemente disfrutar un momento de calma en el corazón del Vedado.',
    },
  ],
};
