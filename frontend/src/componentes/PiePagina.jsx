/**
 * Pie de pagina, igual en todas las secciones publicas.
 */

import { Link } from 'react-router-dom';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { SITIO } from '../configuracion/sitio.js';

export default function PiePagina() {
  const { t } = usarIdioma();
  const anio = new Date().getFullYear();

  return (
    <footer className="pie">
      <div className="pie-contenido">
        <div className="pie-columna">
          <h4>{SITIO.nombre}</h4>
          <p>{t.pieDescripcion}</p>

          <div className="pie-redes">
            <a href={SITIO.redes.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f" />
            </a>
            <a href={SITIO.redes.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram" />
            </a>
            <a href={SITIO.redes.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
              <i className="fab fa-tiktok" />
            </a>
          </div>
        </div>

        <div className="pie-columna">
          <h4>{t.pieEnlaces}</h4>
          <ul>
            <li><Link to="/">{t.navInicio}</Link></li>
            <li><Link to="/tours">{t.navDestinos}</Link></li>
            <li><Link to="/tours-privados">{t.navToursPrivados}</Link></li>
            <li><Link to="/free-walking-tours">{t.navFreeTours}</Link></li>
            <li><Link to="/blogs">{t.navBlogs}</Link></li>
            <li><Link to="/contacto">{t.navContacto}</Link></li>
          </ul>
        </div>

        <div className="pie-columna">
          <h4>{t.navContacto}</h4>
          <p><i className="far fa-envelope" /> {SITIO.correo}</p>
          <p><i className="fas fa-phone" /> {SITIO.telefono}</p>
          <p>
            <a href={`https://wa.me/${SITIO.whatsapp}`} target="_blank" rel="noreferrer">
              <i className="fab fa-whatsapp" /> WhatsApp
            </a>
          </p>
        </div>
      </div>

      <div className="pie-abajo">
        <p>© {anio} {SITIO.nombre}. {t.pieDerechos}</p>
      </div>
    </footer>
  );
}
