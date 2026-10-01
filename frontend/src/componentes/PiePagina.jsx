/**
 * Pie de pagina en tinta oscura.
 *
 * Arriba, la invitacion a escribir en grande, como ultimo empujon antes de
 * irse; al lado, un sello rojo (hanko) con 旅, viaje. Debajo, las columnas de
 * enlaces y, cerrando la pagina, el nombre de la marca a todo lo ancho en
 * contorno: firma el sitio sin competir con el texto de encima.
 */

import { Link } from 'react-router-dom';

import { IconoFlecha } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { SITIO, enlaceWhatsapp } from '../configuracion/sitio.js';
import { reportarClicWhatsapp } from '../servicios/seguimiento.js';
import { IDIOMAS } from '../traducciones/textos.js';
import { EVENTO_ABRIR_COOKIES } from '../servicios/seguimiento.js';

export default function PiePagina() {
  const { t } = usarIdioma();
  const anio = new Date().getFullYear();

  return (
    <footer className="pie">
      <div className="pie-superior">
        <div>
          <span className="entradilla entradilla-clara">{t.navContacto}</span>
          {/* Frase corta a proposito: justo encima termina la llamada final
              de cada pagina, y repetirla aqui se leia como un eco. */}
          <a
            className="pie-invitacion"
            href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
            target="_blank"
            rel="noreferrer"
            onClick={reportarClicWhatsapp}
          >
            {t.hablamos} <IconoFlecha tamano={40} grosor={1} />
          </a>
        </div>

        <span className="sello" aria-hidden="true">旅</span>
      </div>

      <div className="pie-columnas">
        <div>
          <span>{t.pieTours}</span>
          <Link to="/tours">{t.navDestinos}</Link>
          <Link to="/tours-privados">{t.navToursPrivados}</Link>
          <Link to="/free-walking-tours">{t.navFreeTours}</Link>
        </div>

        <div>
          <span>{SITIO.nombre}</span>
          <Link to="/">{t.navInicio}</Link>
          <Link to="/quienes-somos">{t.navQuienesSomos}</Link>
          <Link to="/blogs">{t.navBlogs}</Link>
          <Link to="/contacto">{t.navContacto}</Link>
        </div>

        <div>
          <span>{t.navContacto}</span>
          <a href={`mailto:${SITIO.correo}`}>{SITIO.correo}</a>
          <a href={`tel:+${SITIO.whatsapp}`}>{SITIO.telefono}</a>
          <a href={enlaceWhatsapp(t.mensajeWhatsappGeneral)} target="_blank" rel="noreferrer" onClick={reportarClicWhatsapp}>WhatsApp</a>
        </div>

        <div>
          <span>{t.menuSiguenos}</span>
          <a href={SITIO.redes.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={SITIO.redes.facebook} target="_blank" rel="noreferrer">Facebook</a>
          <a href={SITIO.redes.tiktok} target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>

      <div className="pie-marca" aria-hidden="true">ArigaTours</div>

      <div className="pie-abajo">
        <span>© {anio} {SITIO.nombre}. {t.pieDerechos}</span>
        <span>{IDIOMAS.map((elemento) => elemento.etiqueta).join(' · ')}</span>
        <button
          type="button"
          className="pie-arriba"
          onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR_COOKIES))}
        >
          {t.cookiesEnlace}
        </button>
        <button
          type="button"
          className="pie-arriba"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {t.volverArriba} ↑
        </button>
      </div>
    </footer>
  );
}
