/**
 * getWhatsAppUrl — construye la URL de wa.me con mensaje pre-cargado.
 *
 * Usa globalConfig como fuente del número.
 * El mensaje es opcional — si no se pasa, la URL abre el chat sin texto.
 */
import { globalConfig } from '@/config'

export function getWhatsAppUrl(message?: string): string {
  const number = globalConfig.contact.whatsapp.replace(/\D/g, '')
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
