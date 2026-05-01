// ─── Tipos ────────────────────────────────────────────────────────────────────

export type { CategoryFilters, ProductFilters } from './catalog.service';

// ─── API pública ──────────────────────────────────────────────────────────────

export { getCatalogs, getCatalogBySlug, getCategories, getProducts, getFeaturedProducts, getProductsByCategory, getProductBySlug } from './catalog.service';
export { getPromotions, getActivePromotions, getPromotionById } from './promotions.service';
export { getPosts, getPostBySlug } from './blog.service';
export { getAboutContent } from './about.service';
export { getFaqItems } from './faq.service';
export { getGalleryAlbums, getGalleryPhotos } from './gallery.service';
export { resolveBusinessBySlug, listActiveBusinesses } from './business.service';

// ─── Helpers de dominio ───────────────────────────────────────────────────────

export { isProductAvailable } from './catalog.service';
export { getPromotionStatus, isPromotionActive } from './promotions.service';
