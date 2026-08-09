/**
 * Modelo Blog — articulos y experiencias de viajeros.
 * A diferencia de los tours, cada articulo se escribe en un solo idioma.
 */

import { consultar } from '../configuracion/baseDatos.js';

const CAMPOS = `
  id, idioma, categoria, titulo, autor, fecha, imagen, resumen, contenido,
  publicado, creado_en AS "creadoEn", actualizado_en AS "actualizadoEn"
`;

/**
 * Lista articulos.
 * @param {object} opciones
 * @param {string} [opciones.idioma]    filtra por idioma
 * @param {string} [opciones.categoria] filtra por categoria
 * @param {boolean} [opciones.soloPublicados=true]
 */
export async function listar({ idioma, categoria, soloPublicados = true } = {}) {
  const condiciones = [];
  const parametros = [];

  if (soloPublicados) condiciones.push('publicado = TRUE');

  if (idioma) {
    parametros.push(idioma);
    condiciones.push(`idioma = $${parametros.length}`);
  }

  if (categoria) {
    parametros.push(categoria);
    condiciones.push(`categoria = $${parametros.length}`);
  }

  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const { rows } = await consultar(
    `SELECT ${CAMPOS} FROM blogs ${donde} ORDER BY creado_en DESC`,
    parametros
  );
  return rows;
}

/** Devuelve un articulo por id, o null. */
export async function buscarPorId(id) {
  const { rows } = await consultar(
    `SELECT ${CAMPOS} FROM blogs WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/** Comprueba si ya existe un articulo con ese id. */
export async function existe(id) {
  const { rows } = await consultar('SELECT 1 FROM blogs WHERE id = $1 LIMIT 1', [id]);
  return rows.length > 0;
}

/** Crea un articulo nuevo. */
export async function crear(datos) {
  const { rows } = await consultar(
    `INSERT INTO blogs (id, idioma, categoria, titulo, autor, fecha, imagen, resumen, contenido, publicado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${CAMPOS}`,
    [
      datos.id, datos.idioma, datos.categoria, datos.titulo, datos.autor,
      datos.fecha, datos.imagen, datos.resumen, datos.contenido, datos.publicado,
    ]
  );
  return rows[0];
}

/** Actualiza un articulo existente. Devuelve null si el id no existe. */
export async function actualizar(id, datos) {
  const { rows } = await consultar(
    `UPDATE blogs SET
       idioma = $2, categoria = $3, titulo = $4, autor = $5, fecha = $6,
       imagen = $7, resumen = $8, contenido = $9, publicado = $10,
       actualizado_en = NOW()
     WHERE id = $1
     RETURNING ${CAMPOS}`,
    [
      id, datos.idioma, datos.categoria, datos.titulo, datos.autor,
      datos.fecha, datos.imagen, datos.resumen, datos.contenido, datos.publicado,
    ]
  );
  return rows[0] || null;
}

/** Borra un articulo. Devuelve true si existia. */
export async function eliminar(id) {
  const { rowCount } = await consultar('DELETE FROM blogs WHERE id = $1', [id]);
  return rowCount > 0;
}

/** Categorias distintas que existen, para armar el filtro de la web. */
export async function listarCategorias(idioma) {
  const parametros = [];
  let donde = 'WHERE publicado = TRUE';

  if (idioma) {
    parametros.push(idioma);
    donde += ` AND idioma = $${parametros.length}`;
  }

  const { rows } = await consultar(
    `SELECT DISTINCT categoria FROM blogs ${donde} AND categoria <> '' ORDER BY categoria`,
    parametros
  );
  return rows.map((fila) => fila.categoria);
}
