/**
 * Dashboard del admin autenticado
 *
 * Ruta: /negocios/[slug]/admin
 * Acceso: protegido por sesión (proxy.ts + admin layout)
 */

import Link from 'next/link'
import { getUser } from '@/lib/auth'

interface AdminDashboardProps {
  params: Promise<{ slug: string }>
}

const quickLinks = [
  {
    id: 'catalog',
    title: 'Catálogo',
    description: 'Gestiona catálogos, categorías y productos.',
    path: 'catalog',
  },
  {
    id: 'about',
    title: 'Nosotros',
    description: 'Historia, misión y diferenciadores del negocio.',
    path: 'about',
  },
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Preguntas frecuentes de los clientes.',
    path: 'faq',
  },
  {
    id: 'gallery',
    title: 'Galería',
    description: 'Álbumes y fotos del negocio.',
    path: 'gallery',
  },
  {
    id: 'blog',
    title: 'Blog',
    description: 'Artículos y noticias.',
    path: 'blog',
  },
  {
    id: 'promotions',
    title: 'Promociones',
    description: 'Crea y administra promociones activas, próximas y pausadas.',
    path: 'promotions',
  },
  {
    id: 'business',
    title: 'Ajustes',
    description: 'Configura el nombre, contacto, ubicación y horarios.',
    path: 'business',
  },
]

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { slug } = await params
  const user = await getUser()

  return (
    <div className="max-w-2xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {user?.email}
        </p>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">
          Secciones
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map(link => (
            <Link
              key={link.id}
              href={`/negocios/${slug}/admin/${link.path}`}
              className="group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">
                {link.title}
              </p>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Ver sitio */}
      <div>
        <Link
          href={`/negocios/${slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          Ver sitio público
          <span aria-hidden>↗</span>
        </Link>
      </div>

    </div>
  )
}
