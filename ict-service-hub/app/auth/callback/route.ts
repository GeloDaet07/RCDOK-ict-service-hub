// app/auth/callback/route.ts
// Supabase Auth callback handler

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect based on role (middleware will handle final routing)
      const response = NextResponse.redirect(`${origin}${next}`)
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate, no-cache, post-check=0, pre-check=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }
  }

  const errorResponse = NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
  errorResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate, no-cache, post-check=0, pre-check=0')
  errorResponse.headers.set('Pragma', 'no-cache')
  errorResponse.headers.set('Expires', '0')
  return errorResponse
}
