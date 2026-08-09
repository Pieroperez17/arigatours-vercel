/**
 * Armazon comun de todas las paginas: barra de navegacion arriba,
 * contenido en el medio y pie de pagina abajo.
 *
 * Ademas sube la vista al inicio cada vez que se cambia de ruta, que es lo
 * que uno espera al hacer clic en un enlace del menu.
 */

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import BarraNavegacion from './BarraNavegacion.jsx';
import PiePagina from './PiePagina.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { SITIO } from '../configuracion/sitio.js';

export default function Disenio() {
  const { pathname } = useLocation();
  const { t } = usarIdioma();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <>
      <a className="salto-contenido" href="#contenido">Saltar al contenido</a>

      <BarraNavegacion />

      <main id="contenido">
        <Outlet />
      </main>

      <PiePagina />

      {/* Boton flotante de WhatsApp: se muestra en todas las paginas */}
      <a
        href={`https://wa.me/${SITIO.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-flotante"
        aria-label={t.consultar}
      >
        <i className="fab fa-whatsapp" />
      </a>
    </>
  );
}
