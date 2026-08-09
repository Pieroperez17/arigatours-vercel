-- ═══════════════════════════════════════════════════════════════════════════
--  ESQUEMA DE LA BASE DE DATOS — Agencia de Tours
--
--  Idea general:
--    · "tours"                → datos que NO cambian segun el idioma
--                               (imagenes, duracion, fechas, si esta activo)
--    · "tours_traducciones"   → un registro por tour y por idioma (es / en / ja)
--    · "blogs"                → articulos, cada uno en un idioma
--    · "usuarios"             → acceso al panel de administracion
--    · "consultas"            → mensajes recibidos por el formulario de contacto
--
--  Este archivo es idempotente: se puede ejecutar tantas veces como haga
--  falta sin romper nada (todo usa IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Usuarios del panel administrativo ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  correo      VARCHAR(255) NOT NULL UNIQUE,
  clave_hash  VARCHAR(255) NOT NULL,
  nombre      VARCHAR(120)  NOT NULL DEFAULT 'Administrador',
  rol         VARCHAR(30)   NOT NULL DEFAULT 'admin',
  creado_en   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios (correo);


-- ── Tours: datos independientes del idioma ─────────────────────────────────
CREATE TABLE IF NOT EXISTS tours (
  id                  VARCHAR(120) PRIMARY KEY,          -- ej: "tour-kamakura"
  ciudad_clave        VARCHAR(80)  NOT NULL,             -- ej: "kamakura" (sin tildes, minusculas)
  tipo                VARCHAR(30)  NOT NULL DEFAULT 'privado', -- 'privado' | 'gratuito'
  imagen              TEXT         NOT NULL DEFAULT '',  -- portada
  galeria             JSONB        NOT NULL DEFAULT '[]'::jsonb,
  duracion            VARCHAR(120) NOT NULL DEFAULT '',
  fechas_disponibles  JSONB        NOT NULL DEFAULT '[]'::jsonb,
  orden               INTEGER      NOT NULL DEFAULT 0,   -- para ordenar en la web
  activo              BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tours_ciudad ON tours (ciudad_clave);
CREATE INDEX IF NOT EXISTS idx_tours_tipo   ON tours (tipo);
CREATE INDEX IF NOT EXISTS idx_tours_activo ON tours (activo);


-- ── Tours: textos traducidos (uno por idioma) ──────────────────────────────
CREATE TABLE IF NOT EXISTS tours_traducciones (
  id               SERIAL PRIMARY KEY,
  tour_id          VARCHAR(120) NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  idioma           VARCHAR(5)   NOT NULL,          -- 'es' | 'en' | 'ja'
  titulo           VARCHAR(300) NOT NULL,
  ciudad           VARCHAR(120) NOT NULL DEFAULT '',
  tematica         VARCHAR(160) NOT NULL DEFAULT '',
  precio           VARCHAR(160) NOT NULL DEFAULT '',
  punto_encuentro  TEXT         NOT NULL DEFAULT '',
  descripcion      TEXT         NOT NULL DEFAULT '',
  incluye          JSONB        NOT NULL DEFAULT '[]'::jsonb,
  no_incluye       JSONB        NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT uq_tour_idioma UNIQUE (tour_id, idioma)
);

CREATE INDEX IF NOT EXISTS idx_traducciones_idioma ON tours_traducciones (idioma);


-- ── Blogs / experiencias de viajeros ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id              VARCHAR(120) PRIMARY KEY,
  idioma          VARCHAR(5)   NOT NULL DEFAULT 'es',
  categoria       VARCHAR(120) NOT NULL DEFAULT '',
  titulo          VARCHAR(300) NOT NULL,
  autor           VARCHAR(160) NOT NULL DEFAULT '',
  fecha           VARCHAR(60)  NOT NULL DEFAULT '',
  imagen          TEXT         NOT NULL DEFAULT '',
  resumen         TEXT         NOT NULL DEFAULT '',
  contenido       TEXT         NOT NULL DEFAULT '',
  publicado       BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_idioma    ON blogs (idioma);
CREATE INDEX IF NOT EXISTS idx_blogs_categoria ON blogs (categoria);


-- ── Consultas del formulario de contacto ───────────────────────────────────
CREATE TABLE IF NOT EXISTS consultas (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(200) NOT NULL,
  correo         VARCHAR(255) NOT NULL,
  telefono       VARCHAR(60)  NOT NULL DEFAULT '',
  fecha_viaje    VARCHAR(60)  NOT NULL DEFAULT '',
  mensaje        TEXT         NOT NULL DEFAULT '',
  idioma         VARCHAR(5)   NOT NULL DEFAULT 'es',
  correo_enviado BOOLEAN      NOT NULL DEFAULT FALSE,
  atendida       BOOLEAN      NOT NULL DEFAULT FALSE,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultas_creado ON consultas (creado_en DESC);
