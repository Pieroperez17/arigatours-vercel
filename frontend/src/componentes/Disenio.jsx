/**
 * Armazon comun de todas las paginas: barra de navegacion arriba,
 * contenido en el medio y pie de pagina abajo.
 *
 * Ademas sube la vista al inicio cada vez que se cambia de ruta, que es lo
 * que uno espera al hacer clic en un enlace del menu, y monta el observador
 * que hace entrar suavemente los bloques al desplazarse.
 */

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import BarraNavegacion from './BarraNavegacion.jsx';
import PiePagina from './PiePagina.jsx';
import AvisoCookies from './AvisoCookies.jsx';
import { IconoChat } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarRevelado } from '../ganchos/usarRevelado.js';
import { enlaceWhatsapp } from '../configuracion/sitio.js';
import { reportarClicWhatsapp } from '../servicios/seguimiento.js';

/*
 * Las paginas de contacto de un socio (/contacto/daniela) son un caso
 * aparte: se llega a ellas escaneando un QR y lo unico que tienen que
 * ofrecer son los botones de esa persona. Ni el pie con los enlaces del
 * sitio ni el WhatsApp flotante pintan nada ahi.
 *
 * Con el flotante ademas habia un choque real: escribe al numero de la
 * empresa, asi que quien escaneaba la tarjeta de Daniela y pulsaba ese
 * boton acababa en otro chat, que es justo lo que la tarjeta trata de
 * evitar. Dos botones de WhatsApp a numeros distintos en la misma pantalla
 * es una trampa.
 *
 * La barra de navegacion si se queda: es la unica via para pasar de la
 * tarjeta al resto de la web.
 */
const ES_PAGINA_DE_SOCIO = /^\/contacto\/[^/]+/;

export default function Disenio() {
  const { pathname } = useLocation();
  const { t } = usarIdioma();

  const esPaginaDeSocio = ES_PAGINA_DE_SOCIO.test(pathname);
  const esPanel = pathname.startsWith('/panel');

  usarRevelado();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const conLlamadas = !esPaginaDeSocio && !esPanel;

  return (
    <>
      <a className="salto-contenido" href="#contenido">Saltar al contenido</a>

      <BarraNavegacion />

      {/* En el inicio la portada va a pantalla completa, por debajo de la
          cabecera transparente; en el resto se deja el hueco de la barra. */}
      <main id="contenido" className={pathname === '/' ? 'bajo-cabecera' : undefined}>
        <Outlet />
      </main>

      {!esPaginaDeSocio && <PiePagina />}

      {conLlamadas && (
        /* Una pastilla que dice lo que hace en vez de un icono suelto: al
           pasar el raton se despliega el texto; en movil queda el circulo. */
        <a
          href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
          target="_blank"
          rel="noreferrer"
          onClick={reportarClicWhatsapp}
          className="whatsapp-flotante"
          aria-label={t.reservarWhatsapp}
        >
          <IconoChat tamano={22} />
          <span className="whatsapp-flotante-texto">{t.hablamos}</span>
        </a>
      )}

      <AvisoCookies />
    </>
  );
}
