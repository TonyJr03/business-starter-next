'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  label: string
  pendingLabel?: string
  variant?: 'primary' | 'danger'
  className?: string
}

/**
 * Botón de submit con estado pendiente integrado.
 * Debe estar dentro de un <form> para que useFormStatus funcione.
 */
export function SubmitButton({
  label,
  pendingLabel,
  variant = 'primary',
  className = '',
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  const base =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClass =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${base} ${variantClass} ${className}`}
    >
      {pending ? (pendingLabel ?? label) : label}
    </button>
  )
}
