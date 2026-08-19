-- v1.3: repara el acceso del rol authenticated al perfil sin relajar RLS.
-- Es segura de ejecutar en una base v1.0-v1.2 y no modifica datos existentes.

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON grupos_musculares TO authenticated;
GRANT SELECT, INSERT, UPDATE ON usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ejercicios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON splits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON split_ejercicios TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sesiones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON series TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON prs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

DROP POLICY IF EXISTS "leer perfil propio" ON usuarios;
DROP POLICY IF EXISTS "crear perfil propio" ON usuarios;
DROP POLICY IF EXISTS "actualizar perfil propio" ON usuarios;

CREATE POLICY "leer perfil propio" ON usuarios FOR SELECT TO authenticated
  USING (auth.uid() = usuario_uuid);
CREATE POLICY "crear perfil propio" ON usuarios FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = usuario_uuid);
CREATE POLICY "actualizar perfil propio" ON usuarios FOR UPDATE TO authenticated
  USING (auth.uid() = usuario_uuid)
  WITH CHECK (auth.uid() = usuario_uuid);
