import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  rowToBusinessSettings,
  rowToBusinessDirectoryItem,
  type BusinessSettings,
  type BusinessSettingsRow,
  type BusinessDirectoryItem,
  type BusinessDirectoryRow,
} from '@/lib/persistence'

/**
 * Resuelve un negocio por slug consultando la tabla `businesses` en Supabase.
 *
 * Usa `cache()` de React para deduplicar consultas dentro del mismo render pass.
 * Esto evita viajes redundantes a la DB cuando varios Server Components
 * en el mismo árbol necesitan los datos del negocio.
 *
 * Retorna `null` si el negocio no existe o ante cualquier error.
 */
export const resolveBusinessBySlug = cache(
  async (slug: string): Promise<BusinessSettings | null> => {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('businesses')
      .select('id, slug, name, short_description, whatsapp, phone, email, address, city, country, social, hours')
      .eq('slug', slug)
      .single<BusinessSettingsRow>()

    if (error || !data) return null

    return rowToBusinessSettings(data)
  }
)

/**
 * Devuelve todos los negocios activos para el directorio público.
 *
 * - Filtra por `is_active = true` (negocios publicables).
 * - Selecciona solo los campos necesarios para una tarjeta de directorio.
 * - Ordenados alfabéticamente por nombre.
 * - Retorna array vacío ante cualquier error (estado vacío en la UI).
 */
export async function listActiveBusinesses(): Promise<BusinessDirectoryItem[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('businesses')
    .select('id, slug, name, short_description, city')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .returns<BusinessDirectoryRow[]>()

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[tenant] Error al listar negocios activos:', error.message)
    }
    return []
  }

  return (data ?? []).map(rowToBusinessDirectoryItem)
}
