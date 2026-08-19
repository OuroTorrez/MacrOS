import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// El middleware corre en el edge antes de cada request.
// Su única responsabilidad aquí: refrescar el token de sesión si expiró
// y redirigir a /login si la ruta requiere auth.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca la sesión — no remuevas este await
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  const { pathname } = request.nextUrl
  const esRutaPublica = pathname === '/login' || pathname.startsWith('/auth/')
  const esApi = pathname.startsWith('/api/')

  if (!claims && !esRutaPublica && !esApi) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya está autenticado y va a /login, redirige al home
  if (pathname === '/login' && claims) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Corre en todas las rutas excepto assets estáticos y _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
