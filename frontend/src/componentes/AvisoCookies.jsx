/**
 * Aviso de cookies con aceptar y rechazar, conectado a Google Consent Mode v2.
 *
 * Sale hasta que el visitante elige. La eleccion se guarda en localStorage y
 * index.html la vuelve a aplicar en cada visita antes de gtag('config'). El
 * enlace "Cookies" del pie lo reabre, para poder cambiar de opinion.
 */

import { useEffect, useState } from 'react';

import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import {
  EVENTO_ABRIR_COOKIES,
  guardarEleccionCookies,
  leerEleccionCookies,
} from '../servicios/seguimiento.js';

export default function AvisoCookies() {
  const { t } = usarIdioma();
  const [visible, setVisible] = useState(() => leerEleccionCookies() === null);

  useEffect(() => {
    const abrir = () => setVisible(true);
    window.addEventListener(EVENTO_ABRIR_COOKIES, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_COOKIES, abrir);
  }, []);

  if (!visible) return null;

  function elegir(acepta) {
    guardarEleccionCookies(acepta);
    setVisible(false);
  }

  return (
    <div className="aviso-cookies" role="dialog" aria-live="polite" aria-label={t.cookiesTitulo}>
      <p className="aviso-cookies-titulo">{t.cookiesTitulo}</p>
      <p>{t.cookiesTexto}</p>
      <div className="aviso-cookies-botones">
        <button type="button" className="aviso-cookies-rechazar" onClick={() => elegir(false)}>
          {t.cookiesRechazar}
        </button>
        <button type="button" className="aviso-cookies-aceptar" onClick={() => elegir(true)}>
          {t.cookiesAceptar}
        </button>
      </div>
    </div>
  );
}
