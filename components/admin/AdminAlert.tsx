type AlertType = 'success' | 'error' | 'neutral'

interface AdminAlertProps {
  type: AlertType
  message: string
}

const styles: Record<AlertType, string> = {
  success:
    'border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200',
  error:
    'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200',
  neutral:
    'border-l-4 border-zinc-400 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
}

export function AdminAlert({ type, message }: AdminAlertProps) {
  return (
    <div
      className={`rounded-r-lg px-4 py-3 text-sm ${styles[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  )
}
