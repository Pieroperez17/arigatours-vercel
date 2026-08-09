/**
 * Controlador de tours.
 *
 * Lectura publica (la web) y escritura protegida por JWT (el panel admin).
 *
 * El panel envia los datos como FormData porque puede incluir imagenes.
 * Los campos de texto llegan como strings, por eso todo pasa por
 * "prepararDatosTour" antes de tocar la base de datos.
 */

import * as Tour from '../modelos/modeloTour.js';
import { rutaPublica } from '../intermedios/subirImagenes.js';
import {
  normalizarIdioma,
  normalizarLista,
  generarClave,
  esPrecioGratuito,
  IDIOMAS_VALIDOS,
} from '../utilidades/ayudas.js';

// ── Lectura publica ─────────────────────────────────────────────────────────

/** GET /api/tours?idioma=es&tipo=privado&ciudad=kioto */
export async function listar(req, res, siguiente) {
  try {
    const idioma = normalizarIdioma(req.query.idioma);
    const tipo = ['privado', 'gratuito'].includes(req.query.tipo) ? req.query.tipo : undefined;
    const ciudad = req.query.ciudad ? generarClave(req.query.ciudad) : undefined;

    const tours = await Tour.listar({ idioma, tipo, ciudad });
    res.json(tours);
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/tours/ciudades?idioma=es — para el menu de navegacion. */
export async function listarCiudades(req, res, siguiente) {
  try {
    const idioma = normalizarIdioma(req.query.idioma);
    const ciudades = await Tour.listarCiudades(idioma);
    res.json(ciudades);
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/tours/:id?idioma=es */
export async function obtener(req, res, siguiente) {
  try {
    const idioma = normalizarIdioma(req.query.idioma);
    const tour = await Tour.buscarPorId(req.params.id, idioma);

    if (!tour) {
      return res.status(404).json({ error: 'Tour no encontrado.' });
    }

    res.json(tour);
  } catch (error) {
    siguiente(error);
  }
}

// ── Lectura y escritura para el panel de administracion ─────────────────────

/** GET /api/tours/:id/edicion — devuelve el tour con todos sus idiomas. */
export async function obtenerParaEdicion(req, res, siguiente) {
  try {
    const tour = await Tour.buscarParaEdicion(req.params.id);

    if (!tour) {
      return res.status(404).json({ error: 'Tour no encontrado.' });
    }

    res.json(tour);
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/tours/admin/todos — incluye los tours desactivados. */
export async function listarTodosAdmin(req, res, siguiente) {
  try {
    const idioma = normalizarIdioma(req.query.idioma);
    const tours = await Tour.listar({ idioma, soloActivos: false });
    res.json(tours);
  } catch (error) {
    siguiente(error);
  }
}

/** POST /api/tours */
export async function crear(req, res, siguiente) {
  try {
    const datos = prepararDatosTour(req);
    const errores = validarDatosTour(datos, { exigirId: true });

    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join(' ') });
    }

    if (await Tour.existe(datos.id)) {
      return res.status(409).json({ error: `Ya existe un tour con el identificador "${datos.id}".` });
    }

    await Tour.crear(datos);
    const creado = await Tour.buscarPorId(datos.id, 'es');

    res.status(201).json({ mensaje: 'Tour creado correctamente.', tour: creado });
  } catch (error) {
    siguiente(error);
  }
}

/** PUT /api/tours/:id */
export async function actualizar(req, res, siguiente) {
  try {
    const id = req.params.id;
    const existente = await Tour.buscarParaEdicion(id);

    if (!existente) {
      return res.status(404).json({ error: 'Tour no encontrado.' });
    }

    // Al editar, los campos que no vengan en la peticion conservan su valor
    // actual. Asi se puede, por ejemplo, traducir solo al japones sin tener
    // que reenviar las imagenes ni los textos en espanol.
    const datos = prepararDatosTour(req, existente);
    const errores = validarDatosTour(datos, { exigirId: false, existente });

    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join(' ') });
    }

    await Tour.actualizar(id, datos);
    const actualizado = await Tour.buscarPorId(id, 'es');

    res.json({ mensaje: 'Tour actualizado correctamente.', tour: actualizado });
  } catch (error) {
    siguiente(error);
  }
}

/** DELETE /api/tours/:id */
export async function eliminar(req, res, siguiente) {
  try {
    const borrado = await Tour.eliminar(req.params.id);

    if (!borrado) {
      return res.status(404).json({ error: 'Tour no encontrado.' });
    }

    res.json({ mensaje: 'Tour eliminado correctamente.' });
  } catch (error) {
    siguiente(error);
  }
}

// ── Ayudas internas ─────────────────────────────────────────────────────────

/**
 * Arma el objeto que espera el modelo a partir del cuerpo de la peticion.
 *
 * · Las imagenes subidas se anteponen a las que ya venian por URL.
 * · Si no se indica "tipo", se deduce del precio en espanol
 *   (los tours con precio basado en propinas se marcan como gratuitos).
 * · Si se pasa "existente" (caso PUT), los campos ausentes en la peticion
 *   conservan el valor que ya tenian en la base de datos.
 */
function prepararDatosTour(req, existente = null) {
  const cuerpo = req.body || {};
  const archivos = req.files || {};

  /** Devuelve el valor enviado o, si no vino, el que ya estaba guardado. */
  const valorOEl = (campo, valorEnviado, valorPorDefecto) =>
    cuerpo[campo] === undefined
      ? (existente ? existente[campo] : valorPorDefecto)
      : valorEnviado;

  // Imagen de portada: gana el archivo subido sobre la direccion escrita a mano.
  const archivoPortada = archivos.archivoImagen?.[0];
  const imagenSubida = archivoPortada ? rutaPublica(archivoPortada) : '';

  // Galeria: primero las fotos recien subidas, luego las direcciones ya guardadas.
  const galeriaSubida = (archivos.archivosGaleria || []).map((archivo) => rutaPublica(archivo));
  const galeriaEnviada = cuerpo.galeria === undefined
    ? (existente ? existente.galeria : [])
    : normalizarLista(cuerpo.galeria);
  const galeria = [...galeriaSubida, ...galeriaEnviada];

  const traducciones = extraerTraducciones(cuerpo);

  // Para deducir ciudad y tipo se usa la traduccion espanola enviada y,
  // si no vino, la que ya estaba guardada.
  const espanolVigente = traducciones.es || existente?.traducciones?.es || {};

  const tipoIndicado = ['privado', 'gratuito'].includes(cuerpo.tipo) ? cuerpo.tipo : null;
  const tipoDeducido = espanolVigente.precio !== undefined
    ? (esPrecioGratuito(espanolVigente.precio) ? 'gratuito' : 'privado')
    : (existente?.tipo || 'privado');

  const ordenEnviado = Number(cuerpo.orden);

  return {
    id: generarClave(cuerpo.id || espanolVigente.titulo || ''),
    ciudadClave: generarClave(cuerpo.ciudadClave || espanolVigente.ciudad) || existente?.ciudadClave || '',
    tipo: tipoIndicado || tipoDeducido,
    imagen: imagenSubida || String(cuerpo.imagen ?? existente?.imagen ?? '').trim() || galeria[0] || '',
    galeria,
    duracion: String(valorOEl('duracion', cuerpo.duracion, '') || '').trim(),
    fechasDisponibles: cuerpo.fechasDisponibles === undefined
      ? (existente ? existente.fechasDisponibles : [])
      : normalizarLista(cuerpo.fechasDisponibles),
    orden: Number.isFinite(ordenEnviado) && cuerpo.orden !== undefined && cuerpo.orden !== ''
      ? ordenEnviado
      : (existente?.orden ?? 0),
    activo: cuerpo.activo === undefined
      ? (existente ? existente.activo : true)
      : (cuerpo.activo === 'true' || cuerpo.activo === true),
    traducciones,
  };
}

/**
 * Lee las traducciones del cuerpo. Acepta dos formatos:
 *   1. campo "traducciones" con un JSON completo (lo que manda el panel React)
 *   2. campos planos (titulo, descripcion, ...) que se toman como espanol
 */
function extraerTraducciones(cuerpo) {
  const traducciones = {};

  if (cuerpo.traducciones) {
    try {
      const analizado = typeof cuerpo.traducciones === 'string'
        ? JSON.parse(cuerpo.traducciones)
        : cuerpo.traducciones;

      for (const idioma of IDIOMAS_VALIDOS) {
        if (!analizado[idioma]) continue;
        traducciones[idioma] = limpiarTextos(analizado[idioma]);
      }
    } catch {
      // JSON invalido: se ignora y se intenta con los campos planos
    }
  }

  // Respaldo: campos sueltos = version en espanol
  if (!traducciones.es && cuerpo.titulo) {
    traducciones.es = limpiarTextos(cuerpo);
  }

  return traducciones;
}

/** Normaliza los textos de una traduccion (recorta espacios y arma las listas). */
function limpiarTextos(origen) {
  return {
    titulo: String(origen.titulo || '').trim(),
    ciudad: String(origen.ciudad || '').trim(),
    tematica: String(origen.tematica || '').trim(),
    precio: String(origen.precio || '').trim(),
    puntoEncuentro: String(origen.puntoEncuentro || '').trim(),
    descripcion: String(origen.descripcion || '').trim(),
    incluye: normalizarLista(origen.incluye),
    noIncluye: normalizarLista(origen.noIncluye),
  };
}

/** Devuelve una lista de mensajes de error; vacia significa que todo esta bien. */
function validarDatosTour(datos, { exigirId, existente = null }) {
  const errores = [];

  if (exigirId && !datos.id) {
    errores.push('El identificador del tour es obligatorio.');
  }

  // Al editar basta con que el titulo en espanol exista: puede venir en la
  // peticion o estar ya guardado de antes.
  const tituloEspanol = datos.traducciones.es?.titulo || existente?.traducciones?.es?.titulo || '';

  if (!tituloEspanol) {
    errores.push('El titulo en espanol es obligatorio.');
  }

  if (!datos.ciudadClave) {
    errores.push('La ciudad es obligatoria.');
  }

  if (!datos.imagen) {
    errores.push('Debes subir una imagen de portada o indicar su direccion.');
  }

  return errores;
}
