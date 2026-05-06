// ─── API pública ──────────────────────────────────────────────────────────────

export { getCatalogs, getCatalogBySlug, getCategories, getCategoriesByCatalog, getProducts, getFeaturedProducts, getProductsByCategory, getProductBySlug } from './catalog.service';
export { getPromotions, getActivePromotions, getPromotionById } from './promotions.service';
export { getPosts, getPostBySlug } from './blog.service';
export { getAboutContent } from './about.service';
export { getFaqItems } from './faq.service';
export { getGalleryAlbums, getGalleryPhotos, getPhotosByAlbum } from './gallery.service';
export { resolveBusinessBySlug, listActiveBusinesses } from './business.service';

// ─── Helpers de dominio ───────────────────────────────────────────────────────

export { getPromotionStatus, isPromotionActive } from './promotions.service';
