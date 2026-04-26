'use client'

import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'
import { SubmitButton } from '@/components/ui/SubmitButton'

interface LoginFormProps {
  slug: string
}

export function LoginForm({ slug }: LoginFormProps) {
  const boundLogin = loginAction.bind(null, slug)
  const [state, formAction] = useActionState(boundLogin, null)

  const inputClass =
    'w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors'

  return (
    <form action={formAction} className="space-y-5">

      {state?.error && (
        <div role="alert" className="border-l-4 border-red-500 bg-red-950/50 text-red-300 rounded-r-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@negocio.com"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <SubmitButton label="Ingresar" pendingLabel="Verificando…" className="w-full py-2.5" />

    </form>
  )
}
