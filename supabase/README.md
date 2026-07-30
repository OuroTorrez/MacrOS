# Supabase

1. Aplica primero el schema inicial compartido por el proyecto.
2. Aplica `migrations/202607240001_auth_rls.sql` para sustituir el acceso total de desarrollo por RLS.
3. En **Authentication > URL Configuration**, registra:
   - `http://localhost:3000/auth/callback` para desarrollo.
   - `https://TU-DOMINIO/auth/callback` para producción.
4. Mantén activada la confirmación de email. El callback intercambia el código por la sesión y envía al usuario nuevo a `/onboarding`.

Las variables requeridas siguen siendo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. La clave de servicio no se usa ni debe exponerse al navegador.
