/**
 * Controlador de autenticacion del panel de administracion.
 */

import bcrypt from 'bcryptjs';
import * as Usuario from '../modelos/modeloUsuario.js';
import { firmarToken } from '../utilidades/token.js';
import { esCorreoValido } from '../utilidades/ayudas.js';

/** POST /api/autenticacion/ingresar */
export async function ingresar(req, res, siguiente) {
  try {
    const { correo, clave } = req.body;

    if (!correo || !clave) {
      return res.status(400).json({ error: 'El correo y la clave son obligatorios.' });
    }

    if (!esCorreoValido(correo)) {
      return res.status(400).json({ error: 'El correo no tiene un formato valido.' });
    }

    const usuario = await Usuario.buscarPorCorreo(String(correo).trim().toLowerCase());

    // Mismo mensaje si el usuario no existe o si la clave falla:
    // asi no se revela que correos estan registrados.
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const claveCorrecta = await bcrypt.compare(clave, usuario.clave_hash);

    if (!claveCorrecta) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = firmarToken({
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol: usuario.rol,
    });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    siguiente(error);
  }
}

/*
 * Mínimo de caracteres de la clave nueva.
 *
 * Doce y no ocho: el panel no tiene segundo factor ni bloqueo por intentos
 * mas alla del limitador de ingreso, asi que la clave es lo unico que
 * separa a un extrano de poder editar la web entera.
 */
const LARGO_MINIMO_CLAVE = 12;

/** PATCH /api/autenticacion/clave — cambia la clave del usuario en sesion. */
export async function cambiarClave(req, res, siguiente) {
  try {
    const { claveActual, claveNueva } = req.body || {};

    if (!claveActual || !claveNueva) {
      return res.status(400).json({ error: 'Escribe la clave actual y la nueva.' });
    }

    if (String(claveNueva).length < LARGO_MINIMO_CLAVE) {
      return res.status(400).json({
        error: `La clave nueva debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`,
      });
    }

    if (claveActual === claveNueva) {
      return res.status(400).json({ error: 'La clave nueva tiene que ser distinta de la actual.' });
    }

    const usuario = await Usuario.buscarConClave(req.usuario.id);

    if (!usuario) {
      return res.status(401).json({ error: 'El usuario ya no existe.' });
    }

    /*
     * Se pide la clave actual aunque la sesion ya este iniciada: si alguien
     * se sienta en el ordenador con el panel abierto, sin esto podria
     * cambiar la clave y dejar fuera al dueño.
     */
    const correcta = await bcrypt.compare(claveActual, usuario.clave_hash);

    if (!correcta) {
      return res.status(401).json({ error: 'La clave actual no es correcta.' });
    }

    await Usuario.cambiarClave(usuario.id, await bcrypt.hash(claveNueva, 12));

    res.json({ mensaje: 'Clave actualizada correctamente.' });
  } catch (error) {
    siguiente(error);
  }
}

/** GET /api/autenticacion/perfil — confirma que el token sigue siendo valido. */
export async function perfil(req, res, siguiente) {
  try {
    const usuario = await Usuario.buscarPorId(req.usuario.id);

    if (!usuario) {
      return res.status(401).json({ error: 'El usuario ya no existe.' });
    }

    res.json({ usuario });
  } catch (error) {
    siguiente(error);
  }
}
