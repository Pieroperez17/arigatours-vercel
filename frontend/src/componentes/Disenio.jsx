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

/*
 * Las paginas de contacto de un socio (/contacto/daniela) son un caso
 * aparte: se llega a ellas escaneando un QR y lo unico que tienen que
 * ofrecer son los botones de esa persona. Ni el pie con los enlaces del
 * sitio ni el WhatsApp flotante pintan nada ahi.
 *
 * Con el flotante ademas habia un choque real: escribe al numero de la
 * empresa, asi que quien escaneaba la tarjeta de Daniela y pulsaba ese
 * boton verde acababa en otro chat, que es justo lo que la tarjeta trata
 * de evitar. Dos botones de WhatsApp a numeros distintos en la misma
 * pantalla es una trampa.
 *
 * La barra de navegacion si se queda: es la unica via para pasar de la
 * tarjeta al resto de la web.
 *
 * "/contacto" a secas (el formulario general) no entra aqui: solo las
 * direcciones con algo detras.
 */
const ES_PAGINA_DE_SOCIO = /^\/contacto\/[^/]+/;

export default function Disenio() {
  const { pathname } = useLocation();
  const { t } = usarIdioma();

  const esPaginaDeSocio = ES_PAGINA_DE_SOCIO.test(pathname);

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

      {!esPaginaDeSocio && <PiePagina />}

      {!esPaginaDeSocio && (
        <a
          href={`https://wa.me/${SITIO.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="whatsapp-flotante"
          aria-label={t.consultar}
        >
          <i className="fab fa-whatsapp" />
        </a>
      )}
    </>
  );
}
