// middleware.ts — Root of Next.js project
// ICT Service Hub — Diocese of Kalookan
// RBAC + Rate Limiting + Route Protection

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================
// ROUTE CONFIGURATION
// ============================================================

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/verify']
const USER_ROUTES = ['/dashboard', '/tickets']
const ADMIN_ROUTES = ['/admin']

// Roles allowed per route group
const ROUTE_ROLES: Record<string, string[]> = {
  '/admin': ['ict_staff', 'ict_admin', 'super_admin'],
  '/dashboard': ['requester', 'ict_staff', 'ict_admin', 'super_admin'],
  '/tickets': ['requester', 'ict_staff', 'ict_admin', 'super_admin'],
}

// ============================================================
// IN-MEMORY RATE LIMITER (Edge-compatible, no Redis needed)
// For production, swap with Upstash Redis
// ============================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  return `rl:${ip}`
}

function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

// Clean up old entries periodically (Edge-safe)
function pruneRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key)
  }
}

// ============================================================
// MIDDLEWARE
// ============================================================

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  // Prune store occasionally
  if (Math.random() < 0.01) pruneRateLimitStore()

  // ---- Rate Limiting ----
  const rateLimitKey = getRateLimitKey(req)

  // Stricter limit on auth endpoints
  const isAuthRoute = pathname.startsWith('/auth')
  const limit = isAuthRoute ? 15 : 60
  const windowMs = isAuthRoute ? 60_000 : 60_000

  const { allowed, remaining, resetAt } = checkRateLimit(rateLimitKey, limit, windowMs)

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests. Please wait before trying again.',
        retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
        },
      }
    )
  }

  // Add rate limit headers to response
  res.headers.set('X-RateLimit-Limit', String(limit))
  res.headers.set('X-RateLimit-Remaining', String(remaining))
  res.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))

  // ---- Public Routes: Allow through ----
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  if (isPublic) return res

  // ---- Supabase Auth Session ----
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ---- Not authenticated: redirect to login ----
  if (!session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ---- Fetch user role from profile ----
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, is_suspended')
    .eq('id', session.user.id)
    .single()

  // ---- Suspended or inactive account ----
  if (!profile || !profile.is_active || profile.is_suspended) {
    const suspendedUrl = req.nextUrl.clone()
    suspendedUrl.pathname = '/auth/suspended'
    return NextResponse.redirect(suspendedUrl)
  }

  const userRole = profile.role as string

  // ---- Admin route access control ----
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isAdminRoute) {
    const allowedRoles = ROUTE_ROLES['/admin'] || []
    if (!allowedRoles.includes(userRole)) {
      // Requester trying to access admin — redirect to their dashboard
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ---- Staff trying to access user-only pages ----
  // (Staff always redirected to admin if they go to /dashboard)
  if (
    pathname === '/dashboard' &&
    ['ict_staff', 'ict_admin', 'super_admin'].includes(userRole)
  ) {
    const adminUrl = req.nextUrl.clone()
    adminUrl.pathname = '/admin'
    return NextResponse.redirect(adminUrl)
  }

  // ---- Attach user info to headers for server components ----
  res.headers.set('x-user-id', session.user.id)
  res.headers.set('x-user-role', userRole)
  res.headers.set('x-user-email', session.user.email || '')

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|icons|fonts|api/webhooks).*)',
  ],
}
