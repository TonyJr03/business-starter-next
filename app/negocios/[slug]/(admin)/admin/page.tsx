/**
 * Dashboard del admin
 *
 * Ruta: /negocios/[slug]/admin
 * Acceso: protegido por sesión (proxy.ts + admin layout)
 *
 * Muestra: hub del admin con atajos a funcionalidades principales.
 * M3: Placeholder estructural
 * M4+: Estadísticas, gráficos, gestión real
 */

import Link from 'next/link'

interface AdminDashboardProps {
  params: Promise<{ slug: string }>
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { slug } = await params

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs font-semibold rounded-full mb-4">
          🔒 PROTEGIDO — Requiere sesión
        </span>
        <h1 className="text-4xl font-bold mt-2">Dashboard del Admin</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">slug: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{slug}</code></p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          ✓ Estás autenticado y viendo una página protegida.
          <br />
          <span className="text-xs text-blue-700 dark:text-blue-300 mt-1 block">
            La protección ocurre en dos capas: proxy.ts (optimista) + admin layout (segura).
          </span>
        </p>
      </div>

      <div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          M3 — Placeholder. Hub para gestionar el negocio (M4+).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Módulos placeholder */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-not-allowed opacity-60">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>📦</span> Productos
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Gestiona catálogo, categorías y stock.
            </p>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">M4</span>
          </div>

          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-not-allowed opacity-60">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>🎉</span> Promociones
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Crea y activa promociones y descuentos.
            </p>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">M4</span>
          </div>

          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-not-allowed opacity-60">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>📋</span> Pedidos
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Revisa y gestiona pedidos del negocio.
            </p>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">M4</span>
          </div>

          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-not-allowed opacity-60">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>⚙️</span> Configuración
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Datos básicos, horarios, contacto.
            </p>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">M4</span>
          </div>
        </div>
      </div>

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
