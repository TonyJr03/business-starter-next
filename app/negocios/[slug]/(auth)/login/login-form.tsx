'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction } from '@/actions/auth'

interface LoginFormProps {
  slug: string
}

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" aria-hidden />
      )}
      {pending ? 'Verificando…' : 'Ingresar'}
    </button>
  )
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

      <SubmitBtn />

    </form>
  )
}
