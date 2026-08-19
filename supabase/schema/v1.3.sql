-- =============================================================================
-- MacrOS — SCHEMA v1.3
-- =============================================================================
-- Convenciones:
--   • PKs:          <tabla>_id INT GENERATED ALWAYS AS IDENTITY
--   • usuario_uuid: solo para enlace con auth.users, no se usa como FK interna
--   • usuario_id:   llave de negocio para relaciones entre tablas
--   • Timestamps:   TIMESTAMPTZ para todo lo que tenga hora
--   • Fechas puras: DATE (sin hora) donde aplique
--   • Soft delete:  eliminado_en TIMESTAMPTZ NULL
--   • Pesos:        NUMERIC(6,2) siempre en kg — conversión solo en frontend
--   • Descanso:     INTERVAL — se convierte a segundos en el Route Handler
-- =============================================================================


-- ─── GRUPOS MUSCULARES ────────────────────────────────────────────────────────
CREATE TABLE grupos_musculares (
  grupo_muscular_id   INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre              VARCHAR(50) NOT NULL UNIQUE,
  descripcion         TEXT
);


-- ─── USUARIOS ─────────────────────────────────────────────────────────────────
-- usuario_uuid enlaza con Supabase Auth.
-- usuario_id es la llave de negocio que usan todas las demás tablas.
CREATE TABLE usuarios (
  usuario_uuid        UUID        NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  usuario_id          INT         GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL,
  nombre              VARCHAR(50) NOT NULL,
  apellido_paterno    VARCHAR(50) NOT NULL,
  apellido_materno    VARCHAR(50),
  imagen_perfil       TEXT,
  racha_actual        INT         NOT NULL DEFAULT 0 CHECK (racha_actual >= 0),
  racha_maxima        INT         NOT NULL DEFAULT 0 CHECK (racha_maxima >= 0)
);


-- ─── EJERCICIOS ───────────────────────────────────────────────────────────────
-- usuario_id NULL = ejercicio default de la app
-- usuario_id NOT NULL = ejercicio creado por el usuario
CREATE TABLE ejercicios (
  ejercicio_id        INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  grupo_muscular_id   INT          NOT NULL REFERENCES grupos_musculares(grupo_muscular_id),
  usuario_id          INT          REFERENCES usuarios(usuario_id) ON DELETE SET NULL,
  nombre              VARCHAR(100) NOT NULL,
  descripcion         TEXT,
  imagen_forma        TEXT,
  creado_en           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actualizado_en      TIMESTAMPTZ,
  eliminado_en        TIMESTAMPTZ
);

CREATE INDEX ON ejercicios (grupo_muscular_id);
CREATE INDEX ON ejercicios (usuario_id);
CREATE INDEX ON ejercicios (eliminado_en) WHERE eliminado_en IS NULL;


-- ─── SPLITS ───────────────────────────────────────────────────────────────────
-- usuario_id NULL = split default/plantilla de la app
CREATE TABLE splits (
  split_id            INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id          INT          REFERENCES usuarios(usuario_id) ON DELETE SET NULL,
  nombre              VARCHAR(100) NOT NULL DEFAULT 'Split',
  descripcion         TEXT,
  notas               TEXT,
  creado_en           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actualizado_en      TIMESTAMPTZ,
  eliminado_en        TIMESTAMPTZ
);

CREATE INDEX ON splits (usuario_id);


-- ─── SPLIT_EJERCICIOS ─────────────────────────────────────────────────────────
-- Lista ordenada de ejercicios por split.
-- descanso como INTERVAL — el Route Handler convierte a/desde segundos.
CREATE TABLE split_ejercicios (
  split_ejercicio_id  INT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  split_id            INT      NOT NULL REFERENCES splits(split_id)       ON DELETE CASCADE,
  ejercicio_id        INT      NOT NULL REFERENCES ejercicios(ejercicio_id),
  orden               SMALLINT NOT NULL CHECK (orden >= 1),
  series_objetivo     SMALLINT NOT NULL DEFAULT 3  CHECK (series_objetivo > 0),
  reps_objetivo       SMALLINT NOT NULL DEFAULT 10 CHECK (reps_objetivo > 0),
  descanso            INTERVAL NOT NULL DEFAULT '60 seconds',
  notas               TEXT,
  UNIQUE (split_id, orden)
);

CREATE INDEX ON split_ejercicios (split_id);
CREATE INDEX ON split_ejercicios (ejercicio_id);


-- ─── SESIONES ─────────────────────────────────────────────────────────────────
-- split_id NULL = entrenamiento libre
-- duracion calculada automáticamente por Postgres como columna generada STORED
CREATE TABLE sesiones (
  sesion_id           INT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id          INT         NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  split_id            INT         REFERENCES splits(split_id) ON DELETE SET NULL,
  iniciado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalizado_en       TIMESTAMPTZ CHECK (finalizado_en >= iniciado_en),
  duracion            INTERVAL    GENERATED ALWAYS AS (finalizado_en - iniciado_en) STORED,
  notas               TEXT
);

CREATE INDEX ON sesiones (usuario_id);
CREATE INDEX ON sesiones (split_id);
CREATE INDEX ON sesiones (usuario_id, iniciado_en DESC);


-- ─── SERIES ───────────────────────────────────────────────────────────────────
-- Una serie = un set ejecutado dentro de una sesión.
-- iniciado_en / finalizado_en permiten medir descanso real entre series.
CREATE TABLE series (
  serie_id            INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sesion_id           INT          NOT NULL REFERENCES sesiones(sesion_id)    ON DELETE CASCADE,
  ejercicio_id        INT          NOT NULL REFERENCES ejercicios(ejercicio_id),
  numero_serie        SMALLINT     NOT NULL CHECK (numero_serie >= 1),
  repeticiones        SMALLINT     NOT NULL CHECK (repeticiones >= 1),
  peso_kg             NUMERIC(6,2) NOT NULL CHECK (peso_kg >= 0),
  notas               TEXT,
  iniciado_en         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  finalizado_en       TIMESTAMPTZ,
  UNIQUE (sesion_id, ejercicio_id, numero_serie)
);

CREATE INDEX ON series (sesion_id);
CREATE INDEX ON series (ejercicio_id);
CREATE INDEX ON series (ejercicio_id, peso_kg DESC);


-- ─── PRs ──────────────────────────────────────────────────────────────────────
-- Tabla histórica: cada fila = un PR roto.
-- Para PR vigente:       MAX(peso_kg) o fila más reciente por ejercicio/usuario.
-- Para progreso en tiempo: filtrar por ejercicio y ordenar por fecha.
CREATE TABLE prs (
  pr_id               INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id          INT          NOT NULL REFERENCES usuarios(usuario_id)    ON DELETE CASCADE,
  ejercicio_id        INT          NOT NULL REFERENCES ejercicios(ejercicio_id),
  serie_id            INT          NOT NULL REFERENCES series(serie_id),
  sesion_id           INT          NOT NULL REFERENCES sesiones(sesion_id),
  peso_kg             NUMERIC(6,2) NOT NULL,
  repeticiones        SMALLINT     NOT NULL,
  fecha               DATE         NOT NULL
);

CREATE INDEX ON prs (usuario_id, ejercicio_id);
CREATE INDEX ON prs (ejercicio_id, fecha DESC);
CREATE INDEX ON prs (usuario_id, ejercicio_id, peso_kg DESC);


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE grupos_musculares ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_ejercicios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE series            ENABLE ROW LEVEL SECURITY;
ALTER TABLE prs               ENABLE ROW LEVEL SECURITY;

-- RLS controla qué filas puede usar cada cuenta; estos GRANT habilitan al rol
-- authenticated a llegar a las tablas sin saltarse las políticas.
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

-- grupos_musculares: catálogo público de solo lectura
CREATE POLICY "leer grupos"
  ON grupos_musculares FOR SELECT
  TO authenticated
  USING (true);

-- usuarios: cada quien solo ve y gestiona su propio perfil
CREATE POLICY "leer perfil propio"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_uuid);

CREATE POLICY "crear perfil propio"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_uuid);

CREATE POLICY "actualizar perfil propio"
  ON usuarios FOR UPDATE
  TO authenticated
  USING     (auth.uid() = usuario_uuid)
  WITH CHECK (auth.uid() = usuario_uuid);

-- ejercicios: globales (usuario_id IS NULL) + los propios
CREATE POLICY "leer ejercicios visibles"
  ON ejercicios FOR SELECT
  TO authenticated
  USING (
    usuario_id IS NULL
    OR usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid())
  );

CREATE POLICY "crear ejercicios propios"
  ON ejercicios FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

CREATE POLICY "actualizar ejercicios propios"
  ON ejercicios FOR UPDATE
  TO authenticated
  USING     (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()))
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

-- splits: globales (usuario_id IS NULL) + los propios
CREATE POLICY "leer splits visibles"
  ON splits FOR SELECT
  TO authenticated
  USING (
    usuario_id IS NULL
    OR usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid())
  );

CREATE POLICY "crear splits propios"
  ON splits FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

CREATE POLICY "actualizar splits propios"
  ON splits FOR UPDATE
  TO authenticated
  USING     (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()))
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

CREATE POLICY "eliminar splits propios"
  ON splits FOR DELETE
  TO authenticated
  USING (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

-- split_ejercicios: accesibles si el split padre es visible
CREATE POLICY "leer ejercicios de split visibles"
  ON split_ejercicios FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM splits WHERE splits.split_id = split_ejercicios.split_id)
  );

CREATE POLICY "gestionar ejercicios de split propio"
  ON split_ejercicios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM splits
      WHERE splits.split_id  = split_ejercicios.split_id
        AND splits.usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM splits
      WHERE splits.split_id  = split_ejercicios.split_id
        AND splits.usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid())
    )
  );

-- sesiones: solo las propias
CREATE POLICY "leer sesiones propias"
  ON sesiones FOR SELECT
  TO authenticated
  USING (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

CREATE POLICY "crear sesiones propias"
  ON sesiones FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

CREATE POLICY "actualizar sesiones propias"
  ON sesiones FOR UPDATE
  TO authenticated
  USING     (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()))
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));

-- series: accesibles si la sesión padre pertenece al usuario
CREATE POLICY "gestionar series propias"
  ON series FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM sesiones WHERE sesiones.sesion_id = series.sesion_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM sesiones WHERE sesiones.sesion_id = series.sesion_id)
  );

-- prs: solo los propios
CREATE POLICY "gestionar prs propios"
  ON prs FOR ALL
  TO authenticated
  USING     (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()))
  WITH CHECK (usuario_id = (SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()));


-- =============================================================================
-- DATOS SEMILLA — GRUPOS MUSCULARES
-- =============================================================================
INSERT INTO grupos_musculares (nombre, descripcion) VALUES
  ('Pecho',    'Pectoral mayor y menor'),
  ('Espalda',  'Dorsales, trapecios y romboides'),
  ('Hombros',  'Deltoides anterior, lateral y posterior'),
  ('Bíceps',   'Bíceps braquial y braquiorradial'),
  ('Tríceps',  'Tríceps braquial'),
  ('Piernas',  'Cuádriceps, femorales y gemelos'),
  ('Glúteos',  'Glúteo mayor, medio y menor'),
  ('Core',     'Abdominales, oblicuos y erectores espinales'),
  ('Cardio',   'Actividades cardiovasculares'),
  ('Otro',     'Ejercicios de movilidad, flexibilidad u otros');


-- =============================================================================
-- DATOS SEMILLA — EJERCICIOS BASE
-- =============================================================================
-- usuario_id NULL = ejercicios del catálogo global de la app
INSERT INTO ejercicios (grupo_muscular_id, nombre, descripcion) VALUES
  -- Pecho
  (1,  'Press banca',              'Press horizontal con barra en banca plana'),
  (1,  'Press banca inclinado',    'Press en banca a 30–45 grados, énfasis en pectoral superior'),
  (1,  'Aperturas con mancuernas', 'Apertura en banca plana para pectoral, rango completo'),
  -- Espalda
  (2,  'Peso muerto',              'Levantamiento de barra desde el suelo, cadena posterior'),
  (2,  'Dominadas',                'Pull-up con agarre prono, ancho de hombros o mayor'),
  (2,  'Remo con barra',           'Remo horizontal inclinado con barra para dorsales y romboides'),
  -- Hombros
  (3,  'Press militar',            'Press vertical con barra sobre la cabeza, de pie o sentado'),
  (3,  'Elevaciones laterales',    'Elevación de mancuernas al lateral para deltoides medio'),
  -- Bíceps
  (4,  'Curl con barra',           'Curl de bíceps con barra recta o EZ en posición de pie'),
  (4,  'Curl martillo',            'Curl con agarre neutro con mancuernas, énfasis en braquiorradial'),
  -- Tríceps
  (5,  'Press francés',            'Extensión de tríceps con barra EZ en banca, codos fijos'),
  (5,  'Fondos en paralelas',      'Dips en paralelas con carga corporal o añadida'),
  -- Piernas
  (6,  'Sentadilla',               'Squat con barra en espalda baja o alta, profundidad completa'),
  (6,  'Prensa de piernas',        'Leg press en máquina, ángulo de 45 grados'),
  (6,  'Curl femoral',             'Curl de femorales en máquina tumbado o sentado'),
  -- Glúteos
  (7,  'Hip thrust',               'Empuje de cadera con barra sobre banca, glúteo en contracción máxima'),
  (7,  'Patada de glúteo',         'Extensión de cadera en máquina o polea baja'),
  -- Core
  (8,  'Plancha',                  'Isométrico de core en posición prono, cadera neutra'),
  (8,  'Crunch abdominal',         'Flexión de tronco controlada para abdominales'),
  -- Cardio
  (9,  'Caminadora',               'Cardio en cinta caminadora, velocidad e inclinación variables'),
  (9,  'Bicicleta estática',       'Cardio en bicicleta estática, baja impacto articular');


-- =============================================================================
-- DATOS SEMILLA — SPLITS BASE
-- =============================================================================
-- usuario_id NULL = plantillas globales de la app, disponibles para todos
INSERT INTO splits (usuario_id, nombre, descripcion, notas) VALUES
  (NULL, 'Push',
    'Pecho, hombros y tríceps',
    'Día de empuje de tren superior. Cubre todos los patrones de push horizontal y vertical. '
    'Ideal como primer día del ciclo Push / Pull / Leg.'),

  (NULL, 'Pull',
    'Espalda y bíceps',
    'Día de jalón de tren superior. Combina tirón vertical (dominadas) y horizontal (remo) '
    'más aislamiento de bíceps. Complementa directamente el día Push.'),

  (NULL, 'Pierna',
    'Piernas, glúteos y core',
    'Tren inferior completo. Incluye patrón de sentadilla, bisagra de cadera, '
    'femoral y estabilización de core. El más demandante del ciclo PPL.'),

  (NULL, 'Cuerpo completo',
    'Entrenamiento integral de cuerpo completo',
    'Un ejercicio compuesto por patrón de movimiento: empuje, jalón, sentadilla y core. '
    'Ideal para frecuencia alta (3–4 días) o como sesión única semanal.');


-- ─── CONFIGURACIÓN DE EJERCICIOS POR SPLIT ────────────────────────────────────
WITH configuracion (split_nombre, ejercicio_nombre, orden, series_objetivo, reps_objetivo, descanso) AS (
  VALUES
    -- Push
    ('Push', 'Press banca',              1, 4, 8,  '120 seconds'::interval),
    ('Push', 'Press banca inclinado',    2, 3, 10, '90 seconds'::interval),
    ('Push', 'Press militar',            3, 3, 10, '90 seconds'::interval),
    ('Push', 'Elevaciones laterales',    4, 3, 12, '60 seconds'::interval),
    ('Push', 'Fondos en paralelas',      5, 3, 10, '90 seconds'::interval),
    -- Pull
    ('Pull', 'Peso muerto',              1, 3, 5,  '150 seconds'::interval),
    ('Pull', 'Dominadas',                2, 3, 8,  '120 seconds'::interval),
    ('Pull', 'Remo con barra',           3, 3, 10, '90 seconds'::interval),
    ('Pull', 'Curl con barra',           4, 3, 10, '60 seconds'::interval),
    ('Pull', 'Curl martillo',            5, 3, 12, '60 seconds'::interval),
    -- Pierna
    ('Pierna', 'Sentadilla',             1, 4, 8,  '120 seconds'::interval),
    ('Pierna', 'Prensa de piernas',      2, 3, 10, '90 seconds'::interval),
    ('Pierna', 'Curl femoral',           3, 3, 12, '75 seconds'::interval),
    ('Pierna', 'Hip thrust',             4, 3, 10, '90 seconds'::interval),
    ('Pierna', 'Plancha',               5, 3, 30, '60 seconds'::interval),
    -- Cuerpo completo
    ('Cuerpo completo', 'Sentadilla',    1, 3, 8,  '120 seconds'::interval),
    ('Cuerpo completo', 'Press banca',   2, 3, 8,  '120 seconds'::interval),
    ('Cuerpo completo', 'Remo con barra',3, 3, 10, '90 seconds'::interval),
    ('Cuerpo completo', 'Press militar', 4, 2, 10, '75 seconds'::interval),
    ('Cuerpo completo', 'Plancha',      5, 3, 30, '60 seconds'::interval)
)
INSERT INTO split_ejercicios
  (split_id, ejercicio_id, orden, series_objetivo, reps_objetivo, descanso)
SELECT
  s.split_id,
  e.ejercicio_id,
  c.orden,
  c.series_objetivo,
  c.reps_objetivo,
  c.descanso
FROM configuracion c
JOIN splits     s ON s.usuario_id IS NULL AND s.nombre    = c.split_nombre
JOIN ejercicios e ON e.usuario_id IS NULL AND e.nombre    = c.ejercicio_nombre;
