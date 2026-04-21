/**
 * Página de login
 *
 * Ruta: /negocios/[slug]/login
 * Accesible sin sesión.
 * No protegida por proxy.ts.
 *
 * M3: Placeholder — solo estructura.
 * M4: Será el formulario real con Supabase Auth.
 */

export default async function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Acceso al Admin</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          {/* Form placeholder */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="admin@negocio.com"
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400"
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ingresar (M4)
            </button>
          </form>

          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              Placeholder para M3.{' '}
              <br />
              Lógica real y validación en M4.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
