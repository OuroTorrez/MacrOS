-- Reemplaza las políticas abiertas de desarrollo. Ejecuta esta migración en
-- Supabase después de haber aplicado el schema v1 incluido con el proyecto.
DROP POLICY IF EXISTS "dev_acceso_total" ON grupos_musculares;
DROP POLICY IF EXISTS "dev_acceso_total" ON usuarios;
DROP POLICY IF EXISTS "dev_acceso_total" ON ejercicios;
DROP POLICY IF EXISTS "dev_acceso_total" ON splits;
DROP POLICY IF EXISTS "dev_acceso_total" ON split_ejercicios;
DROP POLICY IF EXISTS "dev_acceso_total" ON sesiones;
DROP POLICY IF EXISTS "dev_acceso_total" ON series;
DROP POLICY IF EXISTS "dev_acceso_total" ON prs;

CREATE POLICY "leer grupos" ON grupos_musculares FOR SELECT TO authenticated USING (true);

CREATE POLICY "leer perfil propio" ON usuarios FOR SELECT TO authenticated USING (auth.uid() = usuario_uuid);
CREATE POLICY "crear perfil propio" ON usuarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_uuid);
CREATE POLICY "actualizar perfil propio" ON usuarios FOR UPDATE TO authenticated USING (auth.uid() = usuario_uuid) WITH CHECK (auth.uid() = usuario_uuid);

CREATE POLICY "leer ejercicios visibles" ON ejercicios FOR SELECT TO authenticated
  USING (usuario_id IS NULL OR usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));
CREATE POLICY "crear ejercicios propios" ON ejercicios FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));
CREATE POLICY "actualizar ejercicios propios" ON ejercicios FOR UPDATE TO authenticated
  USING (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()))
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

CREATE POLICY "leer splits visibles" ON splits FOR SELECT TO authenticated
  USING (usuario_id IS NULL OR usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));
CREATE POLICY "crear splits propios" ON splits FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));
CREATE POLICY "actualizar splits propios" ON splits FOR UPDATE TO authenticated
  USING (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()))
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

CREATE POLICY "leer ejercicios de split visibles" ON split_ejercicios FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM splits WHERE splits.split_id = split_ejercicios.split_id));
CREATE POLICY "gestionar ejercicios de split propio" ON split_ejercicios FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM splits WHERE splits.split_id = split_ejercicios.split_id AND splits.usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM splits WHERE splits.split_id = split_ejercicios.split_id AND splits.usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid())));

CREATE POLICY "leer sesiones propias" ON sesiones FOR SELECT TO authenticated
  USING (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));
CREATE POLICY "crear sesiones propias" ON sesiones FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));
CREATE POLICY "actualizar sesiones propias" ON sesiones FOR UPDATE TO authenticated
  USING (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()))
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

CREATE POLICY "gestionar series propias" ON series FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM sesiones WHERE sesiones.sesion_id = series.sesion_id))
  WITH CHECK (EXISTS (SELECT 1 FROM sesiones WHERE sesiones.sesion_id = series.sesion_id));

CREATE POLICY "gestionar prs propios" ON prs FOR ALL TO authenticated
  USING (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()))
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));
