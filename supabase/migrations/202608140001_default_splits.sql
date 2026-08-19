-- Catálogo inicial reutilizable. El schema v1.0 ya contiene los ejercicios base;
-- esta migración sólo agrega sus plantillas de split y es segura al reintentarse.

INSERT INTO splits (usuario_id, nombre, descripcion, notas)
SELECT NULL, nombre, descripcion, 'Plantilla de la app'
FROM (VALUES
  ('Push', 'Pecho, hombros y tríceps'),
  ('Pull', 'Espalda y bíceps'),
  ('Pierna', 'Piernas, glúteos y core'),
  ('Cuerpo completo', 'Entrenamiento general de todo el cuerpo')
) AS plantillas(nombre, descripcion)
WHERE NOT EXISTS (
  SELECT 1 FROM splits
  WHERE splits.usuario_id IS NULL AND splits.nombre = plantillas.nombre AND splits.eliminado_en IS NULL
);

WITH configuracion (split_nombre, ejercicio_nombre, orden, series_objetivo, reps_objetivo, descanso) AS (
  VALUES
    ('Push', 'Press banca', 1, 4, 8, '120 seconds'::interval),
    ('Push', 'Press banca inclinado', 2, 3, 10, '90 seconds'::interval),
    ('Push', 'Press militar', 3, 3, 10, '90 seconds'::interval),
    ('Push', 'Elevaciones laterales', 4, 3, 12, '60 seconds'::interval),
    ('Push', 'Fondos en paralelas', 5, 3, 10, '90 seconds'::interval),
    ('Pull', 'Peso muerto', 1, 3, 5, '150 seconds'::interval),
    ('Pull', 'Dominadas', 2, 3, 8, '120 seconds'::interval),
    ('Pull', 'Remo con barra', 3, 3, 10, '90 seconds'::interval),
    ('Pull', 'Curl con barra', 4, 3, 10, '60 seconds'::interval),
    ('Pull', 'Curl martillo', 5, 3, 12, '60 seconds'::interval),
    ('Pierna', 'Sentadilla', 1, 4, 8, '120 seconds'::interval),
    ('Pierna', 'Prensa de piernas', 2, 3, 10, '90 seconds'::interval),
    ('Pierna', 'Curl femoral', 3, 3, 12, '75 seconds'::interval),
    ('Pierna', 'Hip thrust', 4, 3, 10, '90 seconds'::interval),
    ('Pierna', 'Plancha', 5, 3, 30, '60 seconds'::interval),
    ('Cuerpo completo', 'Sentadilla', 1, 3, 8, '120 seconds'::interval),
    ('Cuerpo completo', 'Press banca', 2, 3, 8, '120 seconds'::interval),
    ('Cuerpo completo', 'Remo con barra', 3, 3, 10, '90 seconds'::interval),
    ('Cuerpo completo', 'Press militar', 4, 2, 10, '75 seconds'::interval),
    ('Cuerpo completo', 'Plancha', 5, 3, 30, '60 seconds'::interval)
)
INSERT INTO split_ejercicios (split_id, ejercicio_id, orden, series_objetivo, reps_objetivo, descanso)
SELECT splits.split_id, ejercicios.ejercicio_id, configuracion.orden, configuracion.series_objetivo, configuracion.reps_objetivo, configuracion.descanso
FROM configuracion
JOIN splits ON splits.usuario_id IS NULL AND splits.nombre = configuracion.split_nombre
JOIN ejercicios ON ejercicios.usuario_id IS NULL AND ejercicios.nombre = configuracion.ejercicio_nombre
WHERE NOT EXISTS (
  SELECT 1 FROM split_ejercicios
  WHERE split_ejercicios.split_id = splits.split_id AND split_ejercicios.orden = configuracion.orden
);

DROP POLICY IF EXISTS "eliminar splits propios" ON splits;
CREATE POLICY "eliminar splits propios" ON splits FOR DELETE TO authenticated
  USING (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));
