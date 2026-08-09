/**
 * Controlador de socios — las paginas de contacto individuales.
 */

import * as Socio from '../modelos/modeloSocio.js';
import { rutaPublica } from '../intermedios/subirImagenes.js';
import { generarClave } from '../utilidades/ayudas.js';

/** GET /api/socios — solo los activos, para la web publica. */
export async function listar(_req, res, siguiente) {
  try {
    res.json(await Socio.listar());
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/socios/admin/todos — incluye los desactivados. */
export async function listarTodosAdmin(_req, res, siguiente) {
  try {
    res.json(await Socio.listar({ soloActivos: false }));
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/socios/:id */
export async function obtener(req, res, siguiente) {
  try {
    const socio = await Socio.buscarPorId(req.params.id);

    if (!socio || !socio.activo) {
      return res.status(404).json({ error: 'Pagina de contacto no encontrada.' });
    }

    res.json(socio);
  } catch (error) {
    siguiente(error);
  }
}

/** POST /api/socios */
export async function crear(req, res, siguiente) {
  try {
    const datos = prepararDatosSocio(req);

    if (!datos.id) {
      return res.status(400).json({ error: 'La direccion de la pagina es obligatoria.' });
    }

    if (!datos.nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    if (await Socio.existe(datos.id)) {
      return res.status(409).json({ error: `Ya existe una pagina con la direccion "${datos.id}".` });
    }

    const creado = await Socio.crear(datos);
    res.status(201).json({ mensaje: 'Pagina de contacto creada correctamente.', socio: creado });
  } catch (error) {
    siguiente(error);
  }
}

/** PUT /api/socios/:id */
export async function actualizar(req, res, siguiente) {
  try {
    const datos = prepararDatosSocio(req);

    if (!datos.nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    const actualizado = await Socio.actualizar(req.params.id, datos);

    if (!actualizado) {
      return res.status(404).json({ error: 'Pagina de contacto no encontrada.' });
    }

    res.json({ mensaje: 'Pagina de contacto actualizada correctamente.', socio: actualizado });
  } catch (error) {
    siguiente(error);
  }
}

/** DELETE /api/socios/:id */
export async function eliminar(req, res, siguiente) {
  try {
    const borrado = await Socio.eliminar(req.params.id);

    if (!borrado) {
      return res.status(404).json({ error: 'Pagina de contacto no encontrada.' });
    }

    res.json({ mensaje: 'Pagina de contacto eliminada correctamente.' });
  } catch (error) {
    siguiente(error);
  }
}

/**
 * Deja el usuario de Instagram en su forma minima: sin arroba y sin la
 * direccion completa. Se guarda asi porque la pagina publica lo muestra
 * como "@usuario" y lo enlaza como "instagram.com/usuario": teniendo el
 * usuario suelto se arman las dos, al reves no.
 */
function limpiarInstagram(valor) {
  return String(valor || '')
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .trim();
}

/** Arma el objeto que espera el modelo a partir del formulario. */
function prepararDatosSocio(req) {
  const cuerpo = req.body || {};
  const fotoSubida = req.file ? rutaPublica(req.file) : '';

  return {
    id: generarClave(cuerpo.id || cuerpo.nombre || ''),
    nombre: String(cuerpo.nombre || '').trim(),
    cargo: String(cuerpo.cargo || '').trim(),
    foto: fotoSubida || String(cuerpo.foto || '').trim(),
    whatsapp: String(cuerpo.whatsapp || '').trim(),
    instagram: limpiarInstagram(cuerpo.instagram),
    correo: String(cuerpo.correo || '').trim(),
    mensajeWhatsapp: String(cuerpo.mensajeWhatsapp || '').trim(),
    orden: Number.parseInt(cuerpo.orden, 10) || 0,
    activo: cuerpo.activo === undefined ? true : cuerpo.activo === 'true' || cuerpo.activo === true,
  };
}
