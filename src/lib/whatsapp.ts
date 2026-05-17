/**
 * getWhatsAppUrl — construye la URL de wa.me con mensaje pre-cargado.
 *
 * @param message     - Texto pre-cargado en el chat (opcional).
 * @param phoneNumber - Número en formato E.164 (ej. '+5350000000').
 *                      Si no se pasa o está vacío, devuelve undefined.
 */

export function getWhatsAppUrl(message?: string, phoneNumber?: string): string | undefined {
  if (!phoneNumber) return undefined
  const number = phoneNumber.replace(/\D/g, '')
  if (!number) return undefined
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
