import type { BlogPost } from '@/types';

/**
 * blogPosts — artículos del blog (demo).
 *
 * Datos locales tipados. Reemplazar por contenido real o migrar a CMS
 * cuando el volumen de artículos lo justifique.
 *
 * El campo `slug` debe ser único y URL-safe (sin espacios ni tildes).
 * Las entradas se muestran en el orden del array; ordénalas por fecha descendente.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: 'bienvenidos-al-blog',
    title: 'Bienvenidos al blog de Café La Esquina',
    summary:
      'Abrimos este espacio para compartir historias, recetas y novedades de nuestro rincón favorito de La Habana.',
    publishedAt: '2026-04-10',
    author: 'El equipo de Café La Esquina',
    tags: ['noticias', 'bienvenida'],
    body: [
      'Llevamos años sirviendo el mejor café del Vedado y hoy damos un paso más: abrimos este blog para estar más cerca de ustedes.',
      'Aquí encontrarán historias sobre el origen de nuestro café, recetas que puedes probar en casa, tips para preparar un cortadito perfecto y noticias sobre lo que se cuece (literalmente) en nuestra cocina.',
      'También queremos escucharlos. Si tienen preguntas, sugerencias o simplemente quieren compartir su experiencia, pueden escribirnos por WhatsApp o dejarnos un comentario. Nos encanta saber qué piensan.',
      'Este primer artículo es solo el inicio. Nos vemos pronto, con mucho café y buenas historias.',
    ],
  },
  {
    slug: 'historia-del-cortadito-cubano',
    title: 'La historia detrás del cortadito cubano',
    summary:
      'El cortadito es mucho más que una bebida: es un ritual, una pausa, una excusa para conversar. Te contamos su historia.',
    publishedAt: '2026-04-05',
    author: 'El equipo de Café La Esquina',
    tags: ['café', 'cultura', 'historia'],
    body: [
      'El cortadito es, sin duda, uno de los símbolos más reconocibles de la cultura cubana. Una proporción exacta de café espresso y leche caliente que, en apariencia sencilla, esconde décadas de tradición.',
      'Su origen se remonta a principios del siglo XX, cuando el café ya era parte fundamental de la vida cotidiana en Cuba. Las cafeterías de barrio se convirtieron en puntos de encuentro y el cortadito, en el pretexto perfecto para detenerse y conversar.',
      'La clave está en el equilibrio: el espresso cubano es intenso y algo dulce — se bate con azúcar desde el primer chorro — y la leche lo suaviza sin apagarlo. El resultado es una bebida con carácter propio, diferente al cortado español o al macchiato italiano.',
      'En Café La Esquina lo preparamos siguiendo la receta de toda la vida: café oscuro de tueste cubano, azúcar blanca batida a mano y leche entera a temperatura precisa. Sin atajos, sin máquinas automáticas. Como siempre.',
    ],
  },
  {
    slug: 'pastelitos-de-guayaba-receta',
    title: 'Pastelitos de guayaba: la receta que todos piden',
    summary:
      'Una de las delicias más populares de nuestra vitrina llega a tu cocina. Aquí la receta clásica con algunos trucos de la casa.',
    publishedAt: '2026-03-28',
    author: 'El equipo de Café La Esquina',
    tags: ['recetas', 'repostería', 'guayaba'],
    body: [
      'Si hay algo que sale de nuestra cocina antes del mediodía con más rapidez que el café, son los pastelitos de guayaba. Crujientes por fuera, dulces por dentro y con ese aroma inconfundible que ya se siente desde la calle.',
      'La receta es sencilla en ingredientes, pero requiere paciencia. La masa de hojaldre debe trabajarse en frío para que las capas queden bien definidas. El relleno, con pasta de guayaba de buena calidad, hace toda la diferencia.',
      'Los pasos básicos: extiende la masa en láminas finas, coloca una cucharada de pasta de guayaba en el centro, dobla, sella los bordes con tenedor y pinta con huevo batido antes de hornear a 200 °C durante 18-20 minutos.',
      'El truco de la casa: añadir una pizca de queso crema junto a la guayaba. El contraste entre el dulce de la fruta y la acidez suave del queso hace que la combinación sea irresistible. Pruébalo y nos cuentas.',
    ],
  },
];
