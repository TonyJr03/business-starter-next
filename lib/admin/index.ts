// ─── Contexto ─────────────────────────────────────────────────────────────────
export type {
  AdminContext,
  AdminContextResult,
  AdminActionState,
  MutationResult,
  SupabaseServerClient,
} from './context'

export { getAdminContext } from './context'

// ─── Categorías ───────────────────────────────────────────────────────────────
export {
  categoryCreateSchema,
  categoryUpdateSchema,
  createCategory,
  updateCategory,
  deleteCategory,
} from './mutations/categories.mutation'
export type { CategoryCreateInput, CategoryUpdateInput } from './mutations/categories.mutation'

// ─── Productos ────────────────────────────────────────────────────────────────
export {
  productCreateSchema,
  productUpdateSchema,
  createProduct,
  updateProduct,
  deleteProduct,
} from './mutations/products.mutation'
export type { ProductCreateInput, ProductUpdateInput } from './mutations/products.mutation'

// ─── Promociones ──────────────────────────────────────────────────────────────
export {
  promotionCreateSchema,
  promotionUpdateSchema,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from './mutations/promotions.mutation'
export type { PromotionCreateInput, PromotionUpdateInput } from './mutations/promotions.mutation'

// ─── Ajustes del negocio ──────────────────────────────────────────────────────
export {
  settingsUpdateSchema,
  updateSettings,
} from './mutations/settings.mutation'
export type { SettingsUpdateInput } from './mutations/settings.mutation'
