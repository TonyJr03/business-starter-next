/**
 * fieldInputCls — clase base para inputs/selects/textareas estándar (w-full).
 *
 * Combina los estilos base comunes con el borde condicional según estado de error.
 * Úsalo en todos los campos de ancho completo de los formularios admin.
 * Para inputs de ancho fijo (w-28, flex-1, time) usa clases inline directamente.
 *
 * @param hasError — true si el campo tiene un error de validación activo.
 *
 * @example
 *   className={fieldInputCls(!!fieldError('name'))}
 *   className={fieldInputCls()}  // sin estado de error
 */
export function fieldInputCls(hasError?: boolean): string {
  return [
    'w-full rounded-md border px-3 py-2 text-sm',
    'bg-white dark:bg-zinc-900',
    'text-zinc-900 dark:text-zinc-100 placeholder-zinc-400',
    'focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100',
    'transition-colors',
    hasError ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700',
  ].join(' ')
}
