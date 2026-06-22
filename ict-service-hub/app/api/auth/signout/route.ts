// app/api/auth/signout/route.ts

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  
  // Sign out from Supabase - this will also trigger setAll in createSupabaseServerClient
  // which will update the cookie store.
  await supabase.auth.signOut()
  
  // Force redirect to login page with no extra params
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
    status: 302,
  })
}
