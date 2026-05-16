/**
 * Lista de negocios — CRUD
 *
 * Ruta: /superadmin/businesses
 */

import Link from 'next/link'
import { forbidden } from 'next/navigation'
import { getAllBusinesses } from '@/services/business.service'
import { getSuperAdminContext } from '@/lib/admin'
import { BusinessCard } from '@/components/superadmin/BusinessCard'

export default async function SuperAdminBusinessesPage() {
  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) forbidden()

  const businesses = await getAllBusinesses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Negocios</h1>
        <Link
          href="/superadmin/businesses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nuevo negocio
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-lg font-medium mb-2">No hay negocios registrados</p>
          <p className="text-sm">Usa el botón de arriba para crear el primero.</p>
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
