// app/api/auth/signout/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()

  // Derive origin from the actual incoming request — works on localhost AND Vercel
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = `${proto}://${host}`

  return NextResponse.redirect(new URL('/auth/login', origin), { status: 302 })
}