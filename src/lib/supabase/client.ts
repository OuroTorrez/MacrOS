import { createClient } from '@supabase/supabase-js'

// Este cliente se usa SOLO en el servidor (Route Handlers).
// Nunca importes esto desde un componente cliente — usa el cliente browser si lo necesitas.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)