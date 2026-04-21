import type { FaqItem } from '@/types';

/**
 * faqItems — preguntas frecuentes demo.
 *
 * Datos de ejemplo para la página FAQ.
 * Reemplaza el contenido por las preguntas reales del negocio
 * y añade o elimina entradas según sea necesario.
 */
export const faqItems: FaqItem[] = [
  // ── Pedidos ──────────────────────────────────────────────────────────────
  {
    id: 'faq-1',
    category: 'Pedidos',
    question: '¿Cómo puedo hacer un pedido?',
    answer:
      'Puedes hacer tu pedido directamente por WhatsApp. Selecciona los productos en nuestro menú y te enviamos el enlace para confirmar el pedido en segundos.',
  },
  {
    id: 'faq-2',
    category: 'Pedidos',
    question: '¿Aceptan pedidos con anticipación?',
    answer:
      'Sí, aceptamos reservas con hasta 24 horas de anticipación para eventos o grupos. Escríbenos por WhatsApp con los detalles de tu pedido.',
  },
  {
    id: 'faq-3',
    category: 'Pedidos',
    question: '¿Hacen entregas a domicilio?',
    answer:
      'Por el momento nuestro servicio es solo en el local. Estamos evaluando opciones de entrega para el futuro — mantente al tanto de nuestras novedades.',
  },

  // ── Menú y productos ─────────────────────────────────────────────────────
  {
    id: 'faq-4',
    category: 'Menú',
    question: '¿El menú cambia con frecuencia?',
    answer:
      'Mantenemos una carta fija de clásicos, y rotamos productos de temporada mensualmente. Las ofertas especiales se publican en la sección de Promociones.',
  },
  {
    id: 'faq-5',
    category: 'Menú',
    question: '¿Tienen opciones para personas con alguna restricción alimentaria?',
    answer:
      'Contamos con algunas opciones sin gluten y vegetarianas. Infórmanos de tu restricción al hacer el pedido y haremos lo posible por adaptarnos.',
  },

  // ── Horarios y ubicación ─────────────────────────────────────────────────
  {
    id: 'faq-6',
    category: 'Horarios',
    question: '¿Cuáles son los horarios de atención?',
    answer:
      'Estamos abiertos de lunes a viernes de 7:00 a.m. a 8:00 p.m., y los fines de semana de 8:00 a.m. a 6:00 p.m. Los festivos pueden variar — consúltanos por WhatsApp.',
  },
  {
    id: 'faq-7',
    category: 'Horarios',
    question: '¿Dónde están ubicados?',
    answer:
      'Nos encontramos en el Vedado, La Habana. Consulta la sección de Contacto para ver la dirección exacta y el mapa de ubicación.',
  },

  // ── Pagos ────────────────────────────────────────────────────────────────
  {
    id: 'faq-8',
    category: 'Pagos',
    question: '¿Qué formas de pago aceptan?',
    answer:
      'Aceptamos efectivo en moneda nacional. Próximamente habilitaremos más opciones de pago digital — te informaremos por nuestras redes sociales.',
  },
];
