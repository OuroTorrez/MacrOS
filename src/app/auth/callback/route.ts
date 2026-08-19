import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    console.error('Auth callback without code')
    return NextResponse.redirect(new URL('/login?error=confirmacion', origin))
  }

  const supabase = await createSupabaseServer()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback failed:', error.message)
    return NextResponse.redirect(new URL('/login?error=confirmacion', origin))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', origin))

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('usuario_id')
    .eq('usuario_uuid', user.id)
    .maybeSingle()

  return NextResponse.redirect(new URL(perfil ? '/' : '/onboarding', origin))
}
