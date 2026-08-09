/**
 * Modelo Consulta — mensajes que llegan por el formulario de contacto.
 */

import { consultar } from '../configuracion/baseDatos.js';

/** Guarda una consulta nueva y devuelve el registro creado. */
export async function crear({ nombre, correo, telefono, fechaViaje, mensaje, idioma, correoEnviado }) {
  const { rows } = await consultar(
    `INSERT INTO consultas (nombre, correo, telefono, fecha_viaje, mensaje, idioma, correo_enviado)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, nombre, correo, telefono, fecha_viaje, mensaje, idioma, correo_enviado, atendida, creado_en`,
    [nombre, correo, telefono, fechaViaje, mensaje, idioma, correoEnviado]
  );
  return rows[0];
}

/** Lista las consultas mas recientes (para el panel de administracion). */
export async function listar({ limite = 100 } = {}) {
  const { rows } = await consultar(
    `SELECT id, nombre, correo, telefono, fecha_viaje AS "fechaViaje", mensaje,
            idioma, correo_enviado AS "correoEnviado", atendida, creado_en AS "creadoEn"
     FROM consultas
     ORDER BY creado_en DESC
     LIMIT $1`,
    [limite]
  );
  return rows;
}

/** Marca una consulta como atendida o pendiente. */
export async function marcarAtendida(id, atendida) {
  const { rows } = await consultar(
    `UPDATE consultas SET atendida = $2 WHERE id = $1
     RETURNING id, atendida`,
    [id, atendida]
  );
  return rows[0] || null;
}

/** Elimina una consulta. Devuelve true si existia. */
export async function eliminar(id) {
  const { rowCount } = await consultar('DELETE FROM consultas WHERE id = $1', [id]);
  return rowCount > 0;
}
