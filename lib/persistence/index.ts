/**
 * lib/persistence — Capa de persistencia: mappers BD → dominio
 *
 * Organizado por dominio. Todos los módulos re-exportan aquí para que
 * los importadores existentes (`from '@/lib/persistence'`) sigan funcionando.
 *
 * Tipos de dominio (BusinessSettings, BusinessDirectoryItem) viven en `@/types`.
 */

export * from './category';
export * from './product';
export * from './promotion';
export * from './business';

