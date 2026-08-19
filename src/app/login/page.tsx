'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import styles from './page.module.css'

type Modo = 'login' | 'registro' | 'recuperacion'

export default function LoginPage() {
  const [modo, setModo]       = useState<Modo>('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createSupabaseBrowser()

  // ── Email / password ───────────────────────────────────────────────────────
  async function handleEmail() {
    setError(null)
    setMensaje(null)
    if (!email || (modo !== 'recuperacion' && !password)) {
      setError(modo === 'recuperacion' ? 'Escribe tu correo.' : 'Completa email y contraseña.')
      return
    }
    if (modo === 'registro' && password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      if (modo === 'recuperacion') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          options: { redirectTo: `${location.origin}/auth/reset-password` },
        })
        if (error) throw error
        setMensaje('Si existe una cuenta con este correo, recibirás un enlace para restablecer la contraseña.')
      } else if (modo === 'registro') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Supabase redirige aquí después de verificar el email
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMensaje('Revisa tu correo para confirmar tu cuenta.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        location.assign('/')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      // Traducimos los mensajes más comunes de Supabase
      setError(traducirError(msg))
    } finally {
      setLoading(false)
    }
  }

  // ── OAuth ──────────────────────────────────────────────────────────────────
  async function handleOAuth(provider: 'google' | 'apple') {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    // Supabase redirige al provider — el callback maneja el resto
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>MacrOS</h1>
        <p className={styles.sub}>
          {modo === 'login' ? 'Inicia sesión' : modo === 'registro' ? 'Crea tu cuenta' : 'Recupera tu contraseña'}
        </p>

        {/* ── OAuth ── */}
        {modo !== 'recuperacion' && <div className={styles.oauthGroup}>
          <button
            className={`${styles.oauthBtn} ${styles.google}`}
            onClick={() => handleOAuth('google')}
            disabled={loading}
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <button
            className={`${styles.oauthBtn} ${styles.apple}`}
            onClick={() => handleOAuth('apple')}
            disabled={loading}
          >
            <AppleIcon />
            Continuar con Apple
          </button>
        </div>}

        {modo !== 'recuperacion' && <div className={styles.divider}>
          <span>o</span>
        </div>}

        {/* ── Email / password ── */}
        <form className={styles.form} onSubmit={(event) => { event.preventDefault(); handleEmail() }}>
          <label className={styles.label}>
            Correo
            <input
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </label>

          {modo !== 'recuperacion' && <label className={styles.label}>
            Contraseña
            <input
              className={styles.input}
              type="password"
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
              minLength={6}
              required
              value={password}
              onChange={e => setPass(e.target.value)}
              placeholder="········"
            />
          </label>}

          {modo === 'registro' && <label className={styles.label}>
            Repite la contraseña
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={confirmacion}
              onChange={e => setConfirmacion(e.target.value)}
              placeholder="········"
            />
          </label>}

          {error   && <p className={styles.error}>{error}</p>}
          {mensaje && <p className={styles.success}>{mensaje}</p>}

          <button
            className={styles.btn}
            disabled={loading}
            type="submit"
          >
            {loading
              ? 'Cargando...'
              : modo === 'login' ? 'Entrar' : modo === 'registro' ? 'Crear cuenta' : 'Enviar enlace'
            }
          </button>
        </form>

        {/* ── Toggle login/registro ── */}
        {modo === 'login' ? <>
          <p className={styles.toggle}>¿No tienes cuenta? <button className={styles.toggleBtn} onClick={() => setModo('registro')}>Regístrate</button></p>
          <p className={styles.toggle}><button className={styles.toggleBtn} onClick={() => setModo('recuperacion')}>¿Olvidaste tu contraseña?</button></p>
        </> : <p className={styles.toggle}>¿Ya tienes cuenta? <button className={styles.toggleBtn} onClick={() => { setModo('login'); setError(null); setMensaje(null) }}>Inicia sesión</button></p>}
      </div>
    </main>
  )
}

// ── Iconos SVG inline (sin dependencia de icon library) ───────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.19 1.28-2.17 3.81.03 3.02 2.65 4.03 2.68 4.04l-.06.27zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

// ── Traducción de errores de Supabase ─────────────────────────────────────────
function traducirError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('Email not confirmed'))       return 'Confirma tu correo antes de entrar.'
  if (msg.includes('User already registered'))   return 'Ya existe una cuenta con este correo.'
  if (msg.includes('Password should be'))        return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('AuthRetryableFetchError') || msg.includes('fetch failed')) {
    return 'No se pudo conectar con Supabase. El proyecto puede estar pausado por inactividad o no tener conexión. Un administrador debe reanudarlo en Supabase antes de continuar.'
  }
  return msg
}
