/**
 * Contexto de idioma.
 *
 * Guarda el idioma elegido en localStorage y expone:
 *   · idioma        → 'es' | 'en' | 'ja'
 *   · cambiarIdioma → funcion para cambiarlo
 *   · t             → diccionario de textos de ese idioma
 *
 * A diferencia del proyecto original, cambiar de idioma NO recarga la
 * pagina: React vuelve a pedir los datos y repinta solo lo necesario.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { TEXTOS, IDIOMAS } from '../traducciones/textos.js';

const CLAVE_IDIOMA = 'arigatours_idioma';
const CODIGOS_VALIDOS = IDIOMAS.map((elemento) => elemento.codigo);

const ContextoIdioma = createContext(null);

/** Idioma inicial: el guardado antes, si no el del navegador, si no español. */
function detectarIdiomaInicial() {
  const guardado = localStorage.getItem(CLAVE_IDIOMA);
  if (CODIGOS_VALIDOS.includes(guardado)) return guardado;

  const delNavegador = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return CODIGOS_VALIDOS.includes(delNavegador) ? delNavegador : 'es';
}

export function ProveedorIdioma({ children }) {
  const [idioma, setIdioma] = useState(detectarIdiomaInicial);

  // Mantiene sincronizado el atributo lang del <html> (importante para SEO
  // y para que los lectores de pantalla pronuncien bien el contenido).
  useEffect(() => {
    localStorage.setItem(CLAVE_IDIOMA, idioma);
    document.documentElement.lang = idioma;
  }, [idioma]);

  const cambiarIdioma = useCallback((nuevoIdioma) => {
    if (CODIGOS_VALIDOS.includes(nuevoIdioma)) {
      setIdioma(nuevoIdioma);
    }
  }, []);

  const valor = useMemo(
    () => ({ idioma, cambiarIdioma, t: TEXTOS[idioma] || TEXTOS.es }),
    [idioma, cambiarIdioma]
  );

  return <ContextoIdioma.Provider value={valor}>{children}</ContextoIdioma.Provider>;
}

/** Gancho para leer el idioma desde cualquier componente. */
export function usarIdioma() {
  const contexto = useContext(ContextoIdioma);

  if (!contexto) {
    throw new Error('usarIdioma debe usarse dentro de <ProveedorIdioma>.');
  }

  return contexto;
}
