/**
 * Controlador del formulario de contacto.
 *
 * A diferencia del proyecto original, la consulta primero se GUARDA en la
 * base de datos y despues se intenta enviar por correo. Asi, aunque el SMTP
 * falle o no este configurado, no se pierde ningun contacto: el panel de
 * administracion los sigue mostrando.
 */

import * as Consulta from '../modelos/modeloConsulta.js';
import { enviarCorreoConsulta } from '../configuracion/correo.js';
import { normalizarIdioma, esCorreoValido } from '../utilidades/ayudas.js';

const CAMPOS_OBLIGATORIOS = ['nombre', 'correo', 'telefono', 'fechaViaje', 'mensaje'];

/** POST /api/contacto */
export async function enviarConsulta(req, res, siguiente) {
  try {
    const cuerpo = req.body || {};

    const faltantes = CAMPOS_OBLIGATORIOS.filter(
      (campo) => !cuerpo[campo] || String(cuerpo[campo]).trim() === ''
    );

    if (faltantes.length > 0) {
      return res.status(400).json({
        error: `Faltan campos obligatorios: ${faltantes.join(', ')}.`,
      });
    }

    if (!esCorreoValido(cuerpo.correo)) {
      return res.status(400).json({ error: 'El correo electronico no es valido.' });
    }

    const datos = {
      nombre: String(cuerpo.nombre).trim().slice(0, 200),
      correo: String(cuerpo.correo).trim().toLowerCase().slice(0, 255),
      telefono: String(cuerpo.telefono).trim().slice(0, 60),
      fechaViaje: String(cuerpo.fechaViaje).trim().slice(0, 60),
      mensaje: String(cuerpo.mensaje).trim().slice(0, 5000),
      idioma: normalizarIdioma(cuerpo.idioma),
    };

    // El correo puede fallar (SMTP caido, credenciales mal): no debe
    // impedir que la consulta quede registrada.
    let correoEnviado = false;
    try {
      correoEnviado = await enviarCorreoConsulta(datos);
    } catch (errorCorreo) {
      console.error('[contacto] No se pudo enviar el correo:', errorCorreo.message);
    }

    await Consulta.crear({ ...datos, correoEnviado });

    res.status(201).json({
      mensaje: 'Consulta recibida correctamente. Te responderemos muy pronto.',
      correoEnviado,
    });
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/contacto/consultas — listado para el panel de administracion. */
export async function listarConsultas(_req, res, siguiente) {
  try {
    const consultas = await Consulta.listar({ limite: 200 });
    res.json(consultas);
  } catch (error) {
    siguiente(error);
  }
}

/** PATCH /api/contacto/consultas/:id — marcar como atendida o pendiente. */
export async function cambiarEstadoConsulta(req, res, siguiente) {
  try {
    const atendida = req.body?.atendida === true || req.body?.atendida === 'true';
    const consulta = await Consulta.marcarAtendida(Number(req.params.id), atendida);

    if (!consulta) {
      return res.status(404).json({ error: 'Consulta no encontrada.' });
    }

    res.json({ mensaje: 'Estado actualizado.', consulta });
  } catch (error) {
    siguiente(error);
  }
}

/** DELETE /api/contacto/consultas/:id */
export async function eliminarConsulta(req, res, siguiente) {
  try {
    const borrada = await Consulta.eliminar(Number(req.params.id));

    if (!borrada) {
      return res.status(404).json({ error: 'Consulta no encontrada.' });
    }

    res.json({ mensaje: 'Consulta eliminada.' });
  } catch (error) {
    siguiente(error);
  }
}
