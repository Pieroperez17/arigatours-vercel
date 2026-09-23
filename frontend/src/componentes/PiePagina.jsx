/**
 * Pie de pagina, igual en todas las secciones publicas.
 *
 * Va sobre el rojo oscuro de la marca, con el logo en su version blanca: un
 * pie claro despues de la banda rosa de llamada final se fundia con ella y
 * la pagina no parecia terminar.
 */

import { Link } from 'react-router-dom';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { SITIO, enlaceWhatsapp } from '../configuracion/sitio.js';
import { IDIOMAS } from '../traducciones/textos.js';
import { IconoFacebook, IconoInstagram, IconoTiktok } from './Iconos.jsx';

export default function PiePagina() {
  const { t } = usarIdioma();
  const anio = new Date().getFullYear();

  return (
    <footer className="pie">
      <div className="pie-rejilla">
        <div className="pie-marca">
          <img src={SITIO.logoBlanco} alt={SITIO.nombre} width="220" height="88" loading="lazy" />
          <p>{t.pieDescripcion}</p>

          <div className="pie-redes">
            <a href={SITIO.redes.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <IconoFacebook tamano={18} />
            </a>
            <a href={SITIO.redes.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <IconoInstagram tamano={18} />
            </a>
            <a href={SITIO.redes.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
              <IconoTiktok tamano={18} />
            </a>
          </div>
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
            <a href={enlaceWhatsapp(t.mensajeWhatsappGeneral)} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>

      <div className="pie-abajo">
        <span>© {anio} {SITIO.nombre}. {t.pieDerechos}</span>
        <span>{IDIOMAS.map((elemento) => elemento.etiqueta).join(' · ')}</span>
      </div>
    </footer>
  );
}
