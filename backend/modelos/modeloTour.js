/**
 * Modelo Tour — tabla "tours" + tabla "tours_traducciones".
 *
 * Todas las lecturas devuelven el tour ya "aplanado" en un solo objeto,
 * con los textos del idioma pedido y, si falta la traduccion, con los
 * textos en espanol como respaldo. De esa forma el frontend siempre
 * recibe la misma forma de objeto sin importar el idioma.
 */

import { consultar, conTransaccion } from '../configuracion/baseDatos.js';
import { IDIOMAS_VALIDOS, IDIOMA_POR_DEFECTO } from '../utilidades/ayudas.js';

// Bloque SELECT compartido por las consultas de lectura.
// "tr" es la traduccion pedida y "base" la traduccion en espanol (respaldo).
const SELECCION = `
  SELECT
    t.id,
    t.ciudad_clave                                                  AS "ciudadClave",
    t.tipo,
    t.imagen,
    t.galeria,
    t.duracion,
    t.fechas_disponibles                                            AS "fechasDisponibles",
    t.orden,
    t.activo,
    COALESCE(NULLIF(tr.titulo, ''),          base.titulo,          '') AS titulo,
    COALESCE(NULLIF(tr.ciudad, ''),          base.ciudad,          '') AS ciudad,
    COALESCE(NULLIF(tr.tematica, ''),        base.tematica,        '') AS tematica,
    COALESCE(NULLIF(tr.precio, ''),          base.precio,          '') AS precio,
    COALESCE(NULLIF(tr.punto_encuentro, ''), base.punto_encuentro, '') AS "puntoEncuentro",
    COALESCE(NULLIF(tr.descripcion, ''),     base.descripcion,     '') AS descripcion,
    COALESCE(tr.incluye,    base.incluye,    '[]'::jsonb)              AS incluye,
    COALESCE(tr.no_incluye, base.no_incluye, '[]'::jsonb)              AS "noIncluye"
  FROM tours t
  LEFT JOIN tours_traducciones tr   ON tr.tour_id   = t.id AND tr.idioma   = $1
  LEFT JOIN tours_traducciones base ON base.tour_id = t.id AND base.idioma = '${IDIOMA_POR_DEFECTO}'
`;

/**
 * Lista los tours.
 * @param {object} opciones
 * @param {string} opciones.idioma      'es' | 'en' | 'ja'
 * @param {string} [opciones.tipo]      'privado' | 'gratuito'
 * @param {string} [opciones.ciudad]    clave de ciudad, ej. 'kioto'
 * @param {boolean} [opciones.soloActivos=true]
 */
export async function listar({ idioma, tipo, ciudad, soloActivos = true } = {}) {
  const condiciones = [];
  const parametros = [idioma || IDIOMA_POR_DEFECTO];

  if (soloActivos) {
    condiciones.push('t.activo = TRUE');
  }

  if (tipo) {
    parametros.push(tipo);
    condiciones.push(`t.tipo = $${parametros.length}`);
  }

  if (ciudad) {
    parametros.push(ciudad);
    condiciones.push(`t.ciudad_clave = $${parametros.length}`);
  }

  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const { rows } = await consultar(
    `${SELECCION} ${donde} ORDER BY t.orden ASC, t.id ASC`,
    parametros
  );

  return rows;
}

/** Devuelve un tour por su id, o null si no existe. */
export async function buscarPorId(id, idioma = IDIOMA_POR_DEFECTO) {
  const { rows } = await consultar(
    `${SELECCION} WHERE t.id = $2 LIMIT 1`,
    [idioma, id]
  );
  return rows[0] || null;
}

/**
 * Devuelve un tour con TODAS sus traducciones, para editarlo en el panel.
 * Forma: { id, ciudadClave, tipo, ..., traducciones: { es: {...}, en: {...} } }
 */
export async function buscarParaEdicion(id) {
  const { rows: filasTour } = await consultar(
    `SELECT id,
            ciudad_clave       AS "ciudadClave",
            tipo, imagen, galeria, duracion,
            fechas_disponibles AS "fechasDisponibles",
            orden, activo
     FROM tours WHERE id = $1 LIMIT 1`,
    [id]
  );

  if (!filasTour[0]) return null;

  const { rows: filasTraduccion } = await consultar(
    `SELECT idioma, titulo, ciudad, tematica, precio,
            punto_encuentro AS "puntoEncuentro",
            descripcion, incluye,
            no_incluye      AS "noIncluye"
     FROM tours_traducciones WHERE tour_id = $1`,
    [id]
  );

  const traducciones = {};
  for (const fila of filasTraduccion) {
    const { idioma, ...textos } = fila;
    traducciones[idioma] = textos;
  }

  return { ...filasTour[0], traducciones };
}

/** Comprueba si ya existe un tour con ese id. */
export async function existe(id) {
  const { rows } = await consultar('SELECT 1 FROM tours WHERE id = $1 LIMIT 1', [id]);
  return rows.length > 0;
}

/**
 * Crea un tour junto con sus traducciones, todo en una transaccion:
 * si algo falla no queda un tour a medias.
 */
export async function crear(datos) {
  return conTransaccion(async (cliente) => {
    await cliente.query(
      `INSERT INTO tours (id, ciudad_clave, tipo, imagen, galeria, duracion, fechas_disponibles, orden, activo)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8, $9)`,
      [
        datos.id,
        datos.ciudadClave,
        datos.tipo,
        datos.imagen,
        JSON.stringify(datos.galeria),
        datos.duracion,
        JSON.stringify(datos.fechasDisponibles),
        datos.orden,
        datos.activo,
      ]
    );

    await guardarTraducciones(cliente, datos.id, datos.traducciones);
    return datos.id;
  });
}

/**
 * Actualiza un tour existente. Solo toca los idiomas que vengan en "traducciones",
 * asi se puede editar el espanol sin borrar el ingles.
 */
export async function actualizar(id, datos) {
  return conTransaccion(async (cliente) => {
    await cliente.query(
      `UPDATE tours SET
         ciudad_clave       = $2,
         tipo               = $3,
         imagen             = $4,
         galeria            = $5::jsonb,
         duracion           = $6,
         fechas_disponibles = $7::jsonb,
         orden              = $8,
         activo             = $9,
         actualizado_en     = NOW()
       WHERE id = $1`,
      [
        id,
        datos.ciudadClave,
        datos.tipo,
        datos.imagen,
        JSON.stringify(datos.galeria),
        datos.duracion,
        JSON.stringify(datos.fechasDisponibles),
        datos.orden,
        datos.activo,
      ]
    );

    await guardarTraducciones(cliente, id, datos.traducciones);
    return id;
  });
}

/** Borra un tour. Las traducciones caen solas por ON DELETE CASCADE. */
export async function eliminar(id) {
  const { rowCount } = await consultar('DELETE FROM tours WHERE id = $1', [id]);
  return rowCount > 0;
}

/** Inserta o actualiza las traducciones recibidas (uso interno). */
async function guardarTraducciones(cliente, tourId, traducciones = {}) {
  for (const idioma of IDIOMAS_VALIDOS) {
    const textos = traducciones[idioma];
    if (!textos) continue;

    await cliente.query(
      `INSERT INTO tours_traducciones
         (tour_id, idioma, titulo, ciudad, tematica, precio, punto_encuentro, descripcion, incluye, no_incluye)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
       ON CONFLICT (tour_id, idioma) DO UPDATE SET
         titulo          = EXCLUDED.titulo,
         ciudad          = EXCLUDED.ciudad,
         tematica        = EXCLUDED.tematica,
         precio          = EXCLUDED.precio,
         punto_encuentro = EXCLUDED.punto_encuentro,
         descripcion     = EXCLUDED.descripcion,
         incluye         = EXCLUDED.incluye,
         no_incluye      = EXCLUDED.no_incluye`,
      [
        tourId,
        idioma,
        textos.titulo || '',
        textos.ciudad || '',
        textos.tematica || '',
        textos.precio || '',
        textos.puntoEncuentro || '',
        textos.descripcion || '',
        JSON.stringify(textos.incluye || []),
        JSON.stringify(textos.noIncluye || []),
      ]
    );
  }
}

/**
 * Devuelve la lista de ciudades con cuantos tours tiene cada una,
 * en el idioma pedido. Sirve para armar el menu "Ciudades" del navbar.
 */
export async function listarCiudades(idioma = IDIOMA_POR_DEFECTO) {
  const { rows } = await consultar(
    `SELECT t.ciudad_clave AS "clave",
            MIN(COALESCE(NULLIF(tr.ciudad, ''), base.ciudad, t.ciudad_clave)) AS "nombre",
            COUNT(*)::int AS "cantidad"
     FROM tours t
     LEFT JOIN tours_traducciones tr   ON tr.tour_id   = t.id AND tr.idioma   = $1
     LEFT JOIN tours_traducciones base ON base.tour_id = t.id AND base.idioma = '${IDIOMA_POR_DEFECTO}'
     WHERE t.activo = TRUE
     GROUP BY t.ciudad_clave
     ORDER BY "nombre" ASC`,
    [idioma]
  );
  return rows;
}
