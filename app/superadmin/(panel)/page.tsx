/**
 * Dashboard del superadmin
 *
 * Ruta: /superadmin
 * Muestra el resumen de negocios registrados en la plataforma.
 */

import Link from 'next/link'
import { getAllBusinesses } from '@/services/business.service'
import { BusinessCard } from '@/components/superadmin/BusinessCard'

export default async function SuperAdminDashboardPage() {
  const businesses = await getAllBusinesses()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {businesses.length} {businesses.length === 1 ? 'negocio registrado' : 'negocios registrados'}
          </p>
        </div>
        <Link
          href="/superadmin/businesses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nuevo negocio
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-lg font-medium mb-2">No hay negocios aún</p>
          <p className="text-sm">Crea el primer negocio para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  )
}
