// ─── Contexto ─────────────────────────────────────────────────────────────────
export type {
  AdminContext,
  AdminContextResult,
  AdminActionState,
  MutationResult,
  SupabaseServerClient,
} from './context'

export { getAdminContext } from './context'

// ─── Catálogo ─────────────────────────────────────────────────────────────────
export {
  catalogPageCreateSchema,
  catalogPageUpdateSchema,
  createCatalogPage,
  updateCatalogPage,
  deleteCatalogPage,
  categoryCreateSchema,
  categoryUpdateSchema,
  createCategory,
  updateCategory,
  deleteCategory,
  productCreateSchema,
  productUpdateSchema,
  createProduct,
  updateProduct,
  deleteProduct,
} from './mutations/catalog.mutation'
export type {
  CatalogPageCreateInput,
  CatalogPageUpdateInput,
  CategoryCreateInput,
  CategoryUpdateInput,
  ProductCreateInput,
  ProductUpdateInput,
} from './mutations/catalog.mutation'

// ─── Promociones ──────────────────────────────────────────────────────────────
export {
  promotionCreateSchema,
  promotionUpdateSchema,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from './mutations/promotions.mutation'
export type { PromotionCreateInput, PromotionUpdateInput } from './mutations/promotions.mutation'

// ─── About ────────────────────────────────────────────────────────────────────
export {
  aboutUpdateSchema,
  updateAbout,
} from './mutations/about.mutation'
export type { AboutUpdateInput } from './mutations/about.mutation'

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export {
  faqItemCreateSchema,
  faqItemUpdateSchema,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
} from './mutations/faq.mutation'
export type { FaqItemCreateInput, FaqItemUpdateInput } from './mutations/faq.mutation'

// ─── Galería ──────────────────────────────────────────────────────────────────
export {
  albumCreateSchema,
  albumUpdateSchema,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  photoCreateSchema,
  photoUpdateSchema,
  createPhoto,
  updatePhoto,
  deletePhoto,
} from './mutations/gallery.mutation'
export type {
  AlbumCreateInput,
  AlbumUpdateInput,
  PhotoCreateInput,
  PhotoUpdateInput,
} from './mutations/gallery.mutation'

// ─── Blog ─────────────────────────────────────────────────────────────────────
export {
  blogPostCreateSchema,
  blogPostUpdateSchema,
  createPost,
  updatePost,
  deletePost,
} from './mutations/blog.mutation'
export type { BlogPostCreateInput, BlogPostUpdateInput } from './mutations/blog.mutation'

// ─── Ajustes del negocio ──────────────────────────────────────────────────────
export {
  settingsUpdateSchema,
  updateSettings,
} from './mutations/settings.mutation'
export type { SettingsUpdateInput } from './mutations/settings.mutation'

