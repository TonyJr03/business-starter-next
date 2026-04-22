/**
 * Dashboard del admin autenticado
 *
 * Ruta: /negocios/[slug]/admin
 * Acceso: protegido por sesión (proxy.ts + admin layout)
 *
 * Muestra: hub del admin con:
 * - contexto del negocio
 * - usuario autenticado
 * - atajos a secciones futuras (placeholder)
 *
 * M4: Dashboard autenticado funcional con flujo de sesión
 * M5+: Estadísticas, gráficos, datos reales
 */

import Link from 'next/link'
import { getUser } from '@/lib/auth'

interface AdminDashboardProps {
  params: Promise<{ slug: string }>
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { slug } = await params
  const user = await getUser()

  return (
    <div className="space-y-8">
      {/* Header con contexto */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Negocio: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{slug}</code>
            </p>
          </div>
          <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
            ✓ Autenticado
          </span>
        </div>
      </div>

      {/* Info del usuario autenticado */}
      {user && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Sesión activa</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{user.email}</p>
            </div>
            <span className="text-3xl">👤</span>
          </div>
        </div>
      )}

      {/* Grid de módulos */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
          Módulos disponibles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Catálogo */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors bg-white dark:bg-zinc-900 cursor-not-allowed opacity-60">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span>📦</span> Catálogo
              </h3>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                M5
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Gestiona productos, categorías, precios e inventario.
            </p>
          </div>

          {/* Promociones */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors bg-white dark:bg-zinc-900 cursor-not-allowed opacity-60">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span>🎉</span> Promociones
              </h3>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                M5
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Crea y gestiona promociones, descuentos y ofertas especiales.
            </p>
          </div>

          {/* Ajustes */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors bg-white dark:bg-zinc-900 cursor-not-allowed opacity-60">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span>⚙️</span> Ajustes
              </h3>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                M5
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Configuración del negocio, horarios, datos de contacto y preferencias.
            </p>
          </div>

          {/* Placeholder extra */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors bg-white dark:bg-zinc-900 cursor-not-allowed opacity-60">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span>📊</span> Reportes
              </h3>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                M6
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Estadísticas, ventas, comportamiento de clientes y análisis.
            </p>
          </div>
        </div>
      </div>

      {/* Info de estado */}
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <span className="font-semibold">M4 — Dashboard autenticado funcional</span>
          <br />
          <span className="text-xs text-amber-700 dark:text-amber-300 mt-1 block">
            Flujo de autenticación real, sesión persistente y logout funcional.
            Módulos de gestión completa disponibles en M5.
          </span>
        </p>
      </div>

      {/* Navegación */}
      <div className="flex gap-4 pt-4">
        <Link
          href={`/negocios/${slug}`}
          className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
        >
          Ver Home Público
        </Link>
        <Link
          href="/"
          className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
        >
          ← Inicio
        </Link>
      </div>
    </div>
  )
}
