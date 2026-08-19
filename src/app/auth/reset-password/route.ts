import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) return NextResponse.redirect(new URL('/login?error=recuperacion', origin))

  const supabase = await createSupabaseServer()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Password recovery callback failed:', error.message)
    return NextResponse.redirect(new URL('/login?error=recuperacion', origin))
  }

  return NextResponse.redirect(new URL('/restablecer-contrasena', origin))
}
