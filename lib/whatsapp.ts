/**
 * getWhatsAppUrl — construye la URL de wa.me con mensaje pre-cargado.
 *
 * @param message     - Texto pre-cargado en el chat (opcional).
 * @param phoneNumber - Número en formato E.164 (ej. '+5350000000').
 *                      Si no se pasa, usa globalConfig como fallback.
 */
import { globalConfig } from '@/config'

export function getWhatsAppUrl(message?: string, phoneNumber?: string): string {
  const raw = phoneNumber ?? globalConfig.contact.whatsapp
  const number = raw.replace(/\D/g, '')
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
