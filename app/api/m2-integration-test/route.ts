/**
 * Ruta temporal de prueba M2 — Validar integración Supabase + Auth
 *
 * ELIMINAR EN M3 cuando middleware y rutas protegidas estén en lugar.
 *
 * Endpoint: GET /api/m2-integration-test
 * Respuesta: JSON con resultados de validación
 */

import { getUser } from '@/lib/auth'
import { resolveBusinessBySlug } from '@/lib/tenant'

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, { status: 'pass' | 'fail'; message: string; data?: unknown }>,
  }

  // Check 1: getUser() funciona sin romper
  try {
    const user = await getUser()
    results.checks.getUser = {
      status: user === null ? 'pass' : 'pass',
      message: user ? `Authenticated as ${user.id}` : 'No authenticated user (expected for public endpoint)',
      data: user ? { id: user.id, email: user.email } : null,
    }
  } catch (error) {
    results.checks.getUser = {
      status: 'fail',
      message: `Error calling getUser(): ${error instanceof Error ? error.message : String(error)}`,
    }
  }

  // Check 2: resolveBusinessBySlug() devuelve datos
  try {
    const business = await resolveBusinessBySlug('cafe-la-esquina')
    results.checks.resolveBusinessBySlug = {
      status: business ? 'pass' : 'fail',
      message: business
        ? `Business found: ${business.name} (id: ${business.id})`
        : 'Business "cafe-la-esquina" not found in database (check seed.sql)',
      data: business
        ? {
            id: business.id,
            slug: business.slug,
            name: business.name,
            city: business.city,
            country: business.country,
          }
        : null,
    }
  } catch (error) {
    results.checks.resolveBusinessBySlug = {
      status: 'fail',
      message: `Error calling resolveBusinessBySlug(): ${error instanceof Error ? error.message : String(error)}`,
    }
  }

  // Check 3: Env vars están presentes
  try {
    const urlPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const keyPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    const allPresent = urlPresent && keyPresent
    results.checks.envVars = {
      status: allPresent ? 'pass' : 'fail',
      message: allPresent
        ? 'All required env vars present'
        : `Missing: ${!urlPresent ? 'NEXT_PUBLIC_SUPABASE_URL' : ''} ${!keyPresent ? 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' : ''}`,
      data: { urlPresent, keyPresent },
    }
  } catch (error) {
    results.checks.envVars = {
      status: 'fail',
      message: `Error checking env vars: ${error instanceof Error ? error.message : String(error)}`,
    }
  }

  // Summary
  const allPassed = Object.values(results.checks).every((check) => check.status === 'pass')
  return Response.json(
    {
      ...results,
      summary: {
        allPassed,
        message: allPassed
          ? '✓ M2 integration test passed — Supabase + Auth ready'
          : '✗ M2 integration test failed — check errors above',
      },
    },
    { status: allPassed ? 200 : 500 }
  )
}
