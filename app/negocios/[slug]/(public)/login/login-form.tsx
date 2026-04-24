'use client'

/**
 * Formulario de login del admin
 *
 * Client Component — necesita useActionState para manejar el estado
 * de la Server Action (error + pending).
 *
 * Recibe el slug para vincular la acción al tenant correcto.
 */

import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'

interface LoginFormProps {
  slug: string
}

export function LoginForm({ slug }: LoginFormProps) {
  const boundLogin = loginAction.bind(null, slug)
  const [state, formAction, isPending] = useActionState(boundLogin, null)

  return (
    <form action={formAction} className="space-y-4">
      {/* Error de autenticación */}
      {state?.error && (
        <div
          role="alert"
          className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3"
        >
          <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@negocio.com"
          disabled={isPending}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          disabled={isPending}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? 'Verificando…' : 'Ingresar'}
      </button>
    </form>
  )
}
