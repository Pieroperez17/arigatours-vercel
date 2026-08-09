/**
 * Generacion y verificacion de tokens JWT para el panel de administracion.
 */

import jwt from 'jsonwebtoken';

const SECRETO = process.env.JWT_SECRETO || 'secreto_de_desarrollo_no_usar_en_produccion';
const DURACION = process.env.JWT_DURACION || '8h';

/** Firma un token con los datos publicos del usuario. */
export function firmarToken(datosUsuario) {
  return jwt.sign(datosUsuario, SECRETO, { expiresIn: DURACION });
}

/** Verifica un token. Lanza excepcion si es invalido o expiro. */
export function verificarToken(token) {
  return jwt.verify(token, SECRETO);
}
