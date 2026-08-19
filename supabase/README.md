# Supabase

## Versionado

- La versión actual es **v1.3**: [schema/v1.3.sql](schema/v1.3.sql) es el bootstrap completo para una base nueva.
- Para una base ya creada con el schema **v1.0**, aplica en orden:
  1. `migrations/202607240001_auth_rls.sql` (v1.1).
  2. `migrations/202608140001_default_splits.sql` (v1.2).
  3. `migrations/202608140002_usuarios_permissions.sql` (v1.3).

No ejecutes el bootstrap v1.3 sobre una base existente ni reescribas una migración que ya haya sido aplicada.

## Auth
3. En **Authentication > URL Configuration**, registra:
   - `http://localhost:3000/auth/callback` y `http://localhost:3000/auth/reset-password` para desarrollo.
   - `https://TU-DOMINIO/auth/callback` y `https://TU-DOMINIO/auth/reset-password` para producción.
4. Mantén activada la confirmación de email. El callback intercambia el código por la sesión y envía al usuario nuevo a `/onboarding`.

Las variables requeridas siguen siendo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. La clave de servicio no se usa ni debe exponerse al navegador.
