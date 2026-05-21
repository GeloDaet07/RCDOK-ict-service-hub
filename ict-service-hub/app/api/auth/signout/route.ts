// app/api/auth/signout/route.ts

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL!))
}
