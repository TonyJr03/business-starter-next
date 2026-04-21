/**
 * Dashboard del admin
 *
 * Ruta: /negocios/[slug]/admin
 * Requiere sesión (protegido por proxy.ts y admin layout)
 *
 * M3: Placeholder
 * M4: Será el hub del admin con estadísticas, atajos a CRUDs
 */

export default async function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Dashboard del Admin</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        M3 — Área protegida. Placeholder mientras se prepara el login real y CRUDs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placeholder cards */}
        <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="font-semibold mb-2">Productos</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Gestiona catálogo, categorías y stock.
          </p>
        </div>

        <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="font-semibold mb-2">Promociones</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Crea y activa promociones y descuentos.
          </p>
        </div>

        <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="font-semibold mb-2">Pedidos</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Revisa y gestiona pedidos del negocio.
          </p>
        </div>

        <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="font-semibold mb-2">Configuración</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Datos básicos, horarios, contacto.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Status: Estructura admin creada en M3. Lógica real en M4+.
        </p>
      </div>
    </div>
  )
}
