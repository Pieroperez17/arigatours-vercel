/**
 * Manejo centralizado de errores y de rutas inexistentes.
 * Se registran al final de servidor.js, despues de todas las rutas.
 */

import multer from 'multer';

/** Responde 404 cuando ninguna ruta coincidio. */
export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/** Ultimo filtro: convierte cualquier excepcion en una respuesta JSON limpia. */
export function manejadorErrores(error, _req, res, _siguiente) {
  console.error('[error]', error);

  // Errores propios de Multer (archivo muy grande, campo inesperado, etc.)
  if (error instanceof multer.MulterError) {
    const mensajes = {
      LIMIT_FILE_SIZE: 'La imagen supera el limite de 8 MB.',
      LIMIT_FILE_COUNT: 'Demasiados archivos en la peticion.',
      LIMIT_UNEXPECTED_FILE: 'Campo de archivo inesperado.',
    };
    return res.status(400).json({ error: mensajes[error.code] || 'Error al subir el archivo.' });
  }

  // Violacion de clave unica en PostgreSQL
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un registro con ese identificador.' });
  }

  // Violacion de clave foranea
  if (error.code === '23503') {
    return res.status(400).json({ error: 'El registro referenciado no existe.' });
  }

  // La base de datos no responde
  if (error.code === 'ECONNREFUSED' || error.code === '57P03') {
    return res.status(503).json({ error: 'La base de datos no esta disponible en este momento.' });
  }

  const estado = error.estado || error.status || 500;
  const mensaje = estado === 500
    ? 'Error interno del servidor.'
    : (error.message || 'Error en la peticion.');

  res.status(estado).json({ error: mensaje });
}
