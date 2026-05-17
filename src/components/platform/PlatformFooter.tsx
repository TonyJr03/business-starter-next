/**
 * PlatformFooter — pie de la plataforma central.
 *
 * Minimal: solo copyright y año dinámico.
 * Sin la complejidad de columnas de navegación del Footer del tenant.
 */
export function PlatformFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
          © {year} Business Starter. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
