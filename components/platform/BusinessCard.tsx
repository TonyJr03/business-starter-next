import Link from 'next/link'
import type { BusinessDirectoryItem } from '@/types'

interface BusinessCardProps {
  business: BusinessDirectoryItem
}

/**
 * BusinessCard — tarjeta de negocio para el directorio público.
 *
 * Server Component. No usa CSS custom properties de branding del tenant
 * (esas son exclusivas del layout del negocio). Estética neutra de plataforma.
 */
export function BusinessCard({ business }: BusinessCardProps) {
  const { slug, name, shortDescription, city } = business
  const href = `/negocios/${slug}`

  return (
    <article className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-200">

      {/* Franja de color — identificador visual del negocio */}
      <div className="h-1.5 bg-zinc-900 dark:bg-zinc-100 group-hover:bg-zinc-700 dark:group-hover:bg-zinc-300 transition-colors" />

      <div className="flex flex-col flex-1 p-5 gap-3">

        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
              {name}
            </h2>
            {city && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3 h-3 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2 6a6 6 0 1 1 10.89 3.477l2.817 2.816a.75.75 0 0 1-1.06 1.061l-2.817-2.817A6 6 0 0 1 2 6Z"
                    clipRule="evenodd"
                  />
                </svg>
                {city}
              </p>
            )}
          </div>
        </div>

        {/* Descripción corta */}
        {shortDescription && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 flex-1">
            {shortDescription}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label={`Visitar ${name}`}
          >
            Visitar sitio
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
