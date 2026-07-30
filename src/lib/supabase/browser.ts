'use client'

// Cliente para el BROWSER — componentes cliente ('use client').
// Usa @supabase/ssr para sincronizar la sesión con cookies,
// lo que permite que los Route Handlers lean la sesión del usuario.
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createSupabaseBrowser() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return client
}
