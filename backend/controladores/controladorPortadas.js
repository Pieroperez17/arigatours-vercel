/**
 * Controlador de portadas — las fotos de fondo del carrusel y las cabeceras.
 */

import * as Portada from '../modelos/modeloPortada.js';
import { rutaPublica } from '../intermedios/subirImagenes.js';

/** GET /api/portadas — solo las activas, para la web publica. */
export async function listar(_req, res, siguiente) {
  try {
    res.json(await Portada.listar());
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/portadas/admin/todas — incluye las desactivadas. */
export async function listarTodasAdmin(_req, res, siguiente) {
  try {
    res.json(await Portada.listar({ soloActivas: false }));
  } catch (error) {
    siguiente(error);
  }
}

/*
 * Una portada solo puede ser una ruta interna ("/recursos/foto.webp") o una
 * direccion completa ("https://..."). Sin esta comprobacion, cualquier texto
 * pegado en el campo se guarda tal cual y acaba en un background-image que no
 * carga: la portada se ve negra y desde el panel la miniatura sale rota, sin
 * que nada explique por que.
 */
function esImagenValida(valor) {
  return /^\/[^\s]+$/.test(valor) || /^https?:\/\/[^\s]+$/i.test(valor);
}

/**
 * POST /api/portadas
 *
 * Admite las dos formas de anadir una foto: subiendo un archivo, que se va a
 * Blob, o pegando la direccion de una imagen que ya este publicada.
 */
export async function crear(req, res, siguiente) {
  try {
    const subida = req.file ? rutaPublica(req.file) : '';
    const imagen = subida || String(req.body?.imagen || '').trim();

    if (!imagen) {
      return res.status(400).json({ error: 'Sube una imagen o escribe su direccion.' });
    }

    if (!esImagenValida(imagen)) {
      return res.status(400).json({
        error: 'La direccion debe empezar por "/" o por "http".',
      });
    }

    if (await Portada.existe(imagen)) {
      return res.status(409).json({ error: 'Esa imagen ya esta en las portadas.' });
    }

    const creada = await Portada.crear(imagen);
    res.status(201).json({ mensaje: 'Portada anadida correctamente.', portada: creada });
  } catch (error) {
    siguiente(error);
  }
}

/*
 * Las portadas son el fondo de la pagina de inicio y de todas las cabeceras.
 * Quedarse sin ninguna activa dejaria esas zonas en negro, y desde el panel no
 * se ve venir: por eso la ultima no se puede desactivar ni borrar.
 */
async function esLaUltimaActiva(id) {
  const activas = await Portada.contarActivas();
  if (activas > 1) return false;

  const todas = await Portada.listar({ soloActivas: false });
  const objetivo = todas.find((portada) => portada.id === Number(id));
  return Boolean(objetivo?.activo);
}

/** PATCH /api/portadas/:id — activa o desactiva. */
export async function cambiarActivo(req, res, siguiente) {
  try {
    const activo = req.body?.activo === true || req.body?.activo === 'true';

    if (!activo && (await esLaUltimaActiva(req.params.id))) {
      return res.status(409).json({
        error: 'Es la unica portada activa. Activa otra antes de desactivar esta.',
      });
    }

    const portada = await Portada.cambiarActivo(req.params.id, activo);

    if (!portada) {
      return res.status(404).json({ error: 'Portada no encontrada.' });
    }

    res.json({ mensaje: activo ? 'Portada activada.' : 'Portada desactivada.', portada });
  } catch (error) {
    siguiente(error);
  }
}

/** DELETE /api/portadas/:id */
export async function eliminar(req, res, siguiente) {
  try {
    if (await esLaUltimaActiva(req.params.id)) {
      return res.status(409).json({
        error: 'Es la unica portada activa. Anade otra antes de borrar esta.',
      });
    }

    const borrada = await Portada.eliminar(req.params.id);

    if (!borrada) {
      return res.status(404).json({ error: 'Portada no encontrada.' });
    }

    /*
     * Solo se borra la fila, nunca el archivo. Las de la semilla son
     * estaticos del repo que se sirven en cada despliegue, y las subidas
     * podrian estar usandose en otro sitio: borrar el archivo convertiria un
     * "quitar de la portada" en una perdida irreversible.
     */
    res.json({ mensaje: 'Portada eliminada de la lista.' });
  } catch (error) {
    siguiente(error);
  }
}
