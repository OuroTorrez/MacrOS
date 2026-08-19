import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/supabase/server'
import styles from './page.module.css'

export default async function Home() {
  const { authUser, usuario } = await getUsuarioActual()
  if (!authUser) redirect('/login')
  if (!usuario) redirect('/onboarding')

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>MacrOS</p>
      <h1>Hola, <span data-initial>{usuario.nombre}</span></h1>
      <p>Tu cuenta ya está lista. El siguiente paso es iniciar o retomar un entrenamiento.</p>
    </main>
  )
}
