/**
 * lib/admin — Infraestructura de mutaciones del panel admin
 *
 * Exports:
 *   · context  — AdminContext, getAdminContext(), AdminActionState, MutationResult
 *   · mutations — funciones de mutación para cada entidad
 *
 * Las funciones de mutación son TypeScript puro (sin 'use server').
 * Los Server Actions que las invocan se definen en cada feature de app/:
 *   app/negocios/[slug]/(admin)/admin/categories/actions.ts
 *   app/negocios/[slug]/(admin)/admin/products/actions.ts
 *   app/negocios/[slug]/(admin)/admin/promotions/actions.ts
 *   app/negocios/[slug]/(admin)/admin/settings/actions.ts
 */

export type {
  AdminContext,
  AdminContextResult,
  AdminActionState,
  MutationResult,
  SupabaseServerClient,
} from './context'

export { getAdminContext } from './context'

// Categorías
export {
  categoryCreateSchema,
  categoryUpdateSchema,
  createCategory,
  updateCategory,
  deleteCategory,
} from './mutations/categories'
export type { CategoryCreateInput, CategoryUpdateInput } from './mutations/categories'

// Productos
export {
  productCreateSchema,
  productUpdateSchema,
  createProduct,
  updateProduct,
  deleteProduct,
} from './mutations/products'
export type { ProductCreateInput, ProductUpdateInput } from './mutations/products'

// Promociones
export {
  promotionCreateSchema,
  promotionUpdateSchema,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from './mutations/promotions'
export type { PromotionCreateInput, PromotionUpdateInput } from './mutations/promotions'

// Ajustes del negocio
export {
  settingsUpdateSchema,
  updateSettings,
} from './mutations/settings'
export type { SettingsUpdateInput } from './mutations/settings'
