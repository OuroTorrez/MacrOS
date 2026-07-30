import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/supabase/server'
import styles from './page.module.css'

export default async function Home() {
  const { authUser, usuario } = await getUsuarioActual()
  if (!authUser) redirect('/login')
  if (!usuario) redirect('/onboarding')

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Gym Tracker</p>
      <h1>Hola, {usuario.nombre}</h1>
      <p>Tu cuenta ya está lista. El siguiente paso es iniciar o retomar un entrenamiento.</p>
    </main>
  )
}
