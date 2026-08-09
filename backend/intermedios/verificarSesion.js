/**
 * Intermediario de autenticacion.
 *
 * Lee la cabecera "Authorization: Bearer <token>", la valida y deja los datos
 * del usuario en req.usuario. Si el token falta o no sirve, corta con 401.
 */

import { verificarToken } from '../utilidades/token.js';

export function verificarSesion(req, res, siguiente) {
  const cabecera = req.headers.authorization || '';

  if (!cabecera.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token de autenticacion.' });
  }

  const token = cabecera.slice(7).trim();

  try {
    req.usuario = verificarToken(token);
    siguiente();
  } catch {
    res.status(401).json({ error: 'Sesion invalida o expirada. Inicia sesion de nuevo.' });
  }
}

/** Variante que ademas exige un rol concreto (por si mas adelante hay editores). */
export function exigirRol(...rolesPermitidos) {
  return (req, res, siguiente) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta accion.' });
    }
    siguiente();
  };
}
