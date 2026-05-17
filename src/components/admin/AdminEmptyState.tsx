import type { ReactNode } from 'react'

interface AdminEmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="py-16 text-center space-y-3">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      {description && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{description}</p>
      )}
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}
