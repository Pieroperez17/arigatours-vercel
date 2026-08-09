/**
 * Funciones de apoyo usadas en varios controladores.
 */

export const IDIOMAS_VALIDOS = ['es', 'en', 'ja'];
export const IDIOMA_POR_DEFECTO = 'es';

/** Devuelve un idioma soportado; si llega cualquier otra cosa, cae a 'es'. */
export function normalizarIdioma(idioma) {
  const valor = String(idioma || '').toLowerCase().trim();
  return IDIOMAS_VALIDOS.includes(valor) ? valor : IDIOMA_POR_DEFECTO;
}

/**
 * Convierte "Kioto" o "Nara " en "kioto" / "nara":
 * minusculas, sin tildes y sin espacios sobrantes. Se usa como clave de ciudad.
 */
export function generarClave(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // quita tildes (marcas diacriticas)
    .replace(/[^a-z0-9]+/g, '-')      // todo lo raro pasa a guion
    .replace(/^-+|-+$/g, '');         // recorta guiones de los extremos
}

/**
 * Acepta un arreglo real, un JSON en texto o un texto con saltos de linea
 * y siempre devuelve un arreglo de strings limpio.
 * El panel admin manda listas como textarea (una linea por item).
 */
export function normalizarLista(valor) {
  if (Array.isArray(valor)) {
    return valor.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof valor === 'string') {
    const texto = valor.trim();
    if (texto === '') return [];

    if (texto.startsWith('[')) {
      try {
        const analizado = JSON.parse(texto);
        if (Array.isArray(analizado)) {
          return analizado.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // no era JSON valido: se trata como texto con saltos de linea
      }
    }

    return texto.split('\n').map((linea) => linea.trim()).filter(Boolean);
  }

  return [];
}

/**
 * Decide si un tour es gratuito mirando su precio.
 * Replica la logica de la web original: precio vacio, cero, "gratis",
 * "basado en propinas", "based on tips" o "チップ" cuentan como gratuito.
 */
export function esPrecioGratuito(precio) {
  if (precio === 0 || precio === null || precio === undefined) return true;

  const texto = String(precio).toLowerCase().trim();
  if (texto === '') return true;

  if (['0', '0 €', '0€', 'gratis', 'free'].includes(texto)) return true;

  return texto.includes('propina')
    || texto.includes('voluntari')
    || texto.includes('tip')
    || texto.includes('チップ');
}

/** Valida el formato de un correo electronico. */
export function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo || '').trim());
}
