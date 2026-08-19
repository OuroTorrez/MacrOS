import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Usuario } from '@/types'

export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En Server Components el Proxy ya refresca la sesión y no se pueden mutar cookies.
          }
        },
      },
    }
  )
}

// Único punto de entrada para rutas que necesitan identidad y perfil interno.
export async function getUsuarioActual() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const userId = claims?.sub

  if (!userId) return { supabase, authUser: null, usuario: null }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select()
    .eq('usuario_uuid', userId)
    .maybeSingle<Usuario>()

  return { supabase, authUser: { id: userId }, usuario }
}
