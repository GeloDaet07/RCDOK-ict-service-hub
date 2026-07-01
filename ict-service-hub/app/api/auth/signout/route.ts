// app/api/auth/signout/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function handleSignOut() {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')

  // Derive origin from the actual incoming request — works on localhost AND Vercel
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = `${proto}://${host}`

  const response = NextResponse.redirect(new URL('/auth/login', origin), { status: 302 })
  
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate, no-cache, post-check=0, pre-check=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

export async function GET() {
  return handleSignOut()
}

export async function POST() {
  return handleSignOut()
}