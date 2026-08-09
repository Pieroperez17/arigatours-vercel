/**
 * Controlador de blogs / experiencias de viajeros.
 */

import * as Blog from '../modelos/modeloBlog.js';
import { rutaPublica } from '../intermedios/subirImagenes.js';
import { normalizarIdioma, generarClave } from '../utilidades/ayudas.js';

/** GET /api/blogs?idioma=es&categoria=Tips */
export async function listar(req, res, siguiente) {
  try {
    const idioma = normalizarIdioma(req.query.idioma);
    const categoria = req.query.categoria || undefined;

    const blogs = await Blog.listar({ idioma, categoria });
    res.json(blogs);
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/blogs/categorias?idioma=es */
export async function listarCategorias(req, res, siguiente) {
  try {
    const idioma = normalizarIdioma(req.query.idioma);
    const categorias = await Blog.listarCategorias(idioma);
    res.json(categorias);
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/blogs/admin/todos — incluye los borradores sin publicar. */
export async function listarTodosAdmin(_req, res, siguiente) {
  try {
    const blogs = await Blog.listar({ soloPublicados: false });
    res.json(blogs);
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/blogs/:id */
export async function obtener(req, res, siguiente) {
  try {
    const blog = await Blog.buscarPorId(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Articulo no encontrado.' });
    }

    res.json(blog);
  } catch (error) {
    siguiente(error);
  }
}

/** POST /api/blogs */
export async function crear(req, res, siguiente) {
  try {
    const datos = prepararDatosBlog(req);

    if (!datos.id) {
      return res.status(400).json({ error: 'El identificador del articulo es obligatorio.' });
    }

    if (!datos.titulo) {
      return res.status(400).json({ error: 'El titulo es obligatorio.' });
    }

    if (await Blog.existe(datos.id)) {
      return res.status(409).json({ error: `Ya existe un articulo con el identificador "${datos.id}".` });
    }

    const creado = await Blog.crear(datos);
    res.status(201).json({ mensaje: 'Articulo creado correctamente.', blog: creado });
  } catch (error) {
    siguiente(error);
  }
}

/** PUT /api/blogs/:id */
export async function actualizar(req, res, siguiente) {
  try {
    const datos = prepararDatosBlog(req);

    if (!datos.titulo) {
      return res.status(400).json({ error: 'El titulo es obligatorio.' });
    }

    const actualizado = await Blog.actualizar(req.params.id, datos);

    if (!actualizado) {
      return res.status(404).json({ error: 'Articulo no encontrado.' });
    }

    res.json({ mensaje: 'Articulo actualizado correctamente.', blog: actualizado });
  } catch (error) {
    siguiente(error);
  }
}

/** DELETE /api/blogs/:id */
export async function eliminar(req, res, siguiente) {
  try {
    const borrado = await Blog.eliminar(req.params.id);

    if (!borrado) {
      return res.status(404).json({ error: 'Articulo no encontrado.' });
    }

    res.json({ mensaje: 'Articulo eliminado correctamente.' });
  } catch (error) {
    siguiente(error);
  }
}

/** Arma el objeto que espera el modelo a partir del formulario. */
function prepararDatosBlog(req) {
  const cuerpo = req.body || {};
  const imagenSubida = req.file ? rutaPublica(req.file) : '';

  return {
    id: generarClave(cuerpo.id || cuerpo.titulo || ''),
    idioma: normalizarIdioma(cuerpo.idioma),
    categoria: String(cuerpo.categoria || '').trim(),
    titulo: String(cuerpo.titulo || '').trim(),
    autor: String(cuerpo.autor || '').trim(),
    fecha: String(cuerpo.fecha || '').trim(),
    imagen: imagenSubida || String(cuerpo.imagen || '').trim(),
    resumen: String(cuerpo.resumen || '').trim(),
    contenido: String(cuerpo.contenido || '').trim(),
    publicado: cuerpo.publicado === undefined ? true : cuerpo.publicado === 'true' || cuerpo.publicado === true,
  };
}
