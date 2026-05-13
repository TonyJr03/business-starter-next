import Link from 'next/link'
import type { BusinessSettings } from '@/types'

interface BusinessCardProps {
  business: BusinessSettings
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      href={`/superadmin/businesses/${business.id}`}
      className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-700 dark:group-hover:text-white transition-colors">
            {business.name}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">/{business.slug}</p>
        </div>
        <span
          className={[
            'shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            business.isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
          ].join(' ')}
        >
          {business.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {business.shortDescription && (
        <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{business.shortDescription}</p>
      )}

      {business.location?.city && (
        <p className="text-xs text-zinc-400 mt-2">{business.location.city}</p>
      )}
    </Link>
  )
}
