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
