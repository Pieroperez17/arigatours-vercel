/**
 * Cabecera con el logo al centro y todo el menu detras de un boton.
 *
 * En la portada del inicio va transparente, sobre la foto, con el logo en
 * blanco; en cuanto se baja un poco (o en cualquier otra pagina) pasa a
 * barra blanca. El boton "Menu" abre una capa a pantalla completa con los
 * enlaces grandes y numerados, las ciudades (que salen de la base) y una
 * foto de portada que cambia segun el enlace sobre el que se pasa.
 *
 * La capa se cierra con Escape, con el propio boton o al navegar. Mientras
 * esta abierta el fondo no se desplaza y el foco se queda dentro.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarCiudades } from '../ganchos/usarPeticion.js';
import { usarPortadas } from '../ganchos/usarPortadas.js';
import { IDIOMAS } from '../traducciones/textos.js';
import { SITIO, enlaceWhatsapp } from '../configuracion/sitio.js';
import { reportarClicWhatsapp } from '../servicios/seguimiento.js';
import { IconoFacebook, IconoInstagram, IconoTiktok, IconoUsuario } from './Iconos.jsx';

export default function BarraNavegacion() {
  const { idioma, cambiarIdioma, t } = usarIdioma();
  const { ciudades } = usarCiudades(idioma);
  const portadas = usarPortadas();
  const { pathname, search } = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [desplazado, setDesplazado] = useState(false);
  const [fotoMenu, setFotoMenu] = useState(0);

  const primerEnlace = useRef(null);
  const botonMenu = useRef(null);

  const enInicio = pathname === '/';
  const sobreFoto = enInicio && !desplazado && !menuAbierto;

  const enlaces = [
    { destino: '/', texto: t.navInicio, fin: true },
    { destino: '/tours', texto: t.navDestinos },
    { destino: '/tours-privados', texto: t.navToursPrivados },
    { destino: '/free-walking-tours', texto: t.navFreeTours },
    { destino: '/quienes-somos', texto: t.navQuienesSomos },
    { destino: '/blogs', texto: t.navBlogs },
    { destino: '/contacto', texto: t.navContacto },
  ];

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname, search]);

  useEffect(() => {
    function alDesplazar() {
      setDesplazado(window.scrollY > 60);
    }

    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, []);

  useEffect(() => {
    if (!menuAbierto) return undefined;

    document.body.style.overflow = 'hidden';
    primerEnlace.current?.focus();

    function alPulsarTecla(evento) {
      if (evento.key === 'Escape') {
        setMenuAbierto(false);
        botonMenu.current?.focus();
      }
    }

    document.addEventListener('keydown', alPulsarTecla);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', alPulsarTecla);
    };
  }, [menuAbierto]);

  const clases = [
    'cabecera',
    sobreFoto && 'sobre-foto',
    desplazado && 'desplazada',
    menuAbierto && 'con-menu',
  ].filter(Boolean).join(' ');

  return (
    <header className={clases}>
      <div className="cabecera-barra">
        <button
          type="button"
          ref={botonMenu}
          className="cabecera-menu"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-expanded={menuAbierto}
          aria-controls="menu-completo"
        >
          <span className="hamburguesa" aria-hidden="true"><i /><i /></span>
          <span className="cabecera-menu-texto">{menuAbierto ? t.cerrarMenu : t.menu}</span>
        </button>

        <Link to="/" className="cabecera-logo" aria-label={SITIO.nombre}>
          <img src={sobreFoto || menuAbierto ? SITIO.logoBlanco : SITIO.logo} alt={SITIO.nombre} width="150" height="60" />
        </Link>

        <div className="cabecera-herramientas">
          <select
            className="selector-idioma"
            value={idioma}
            onChange={(evento) => cambiarIdioma(evento.target.value)}
            aria-label="Idioma"
          >
            {IDIOMAS.map((elemento) => (
              <option key={elemento.codigo} value={elemento.codigo}>{elemento.etiqueta}</option>
            ))}
          </select>

          <a
            className="cabecera-reservar"
            href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
            target="_blank"
            rel="noreferrer"
            onClick={reportarClicWhatsapp}
          >
            {t.reservar}
          </a>
        </div>
      </div>

      <div
        id="menu-completo"
        className={`menu-completo${menuAbierto ? ' abierto' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.menu}
        aria-hidden={!menuAbierto}
        inert={menuAbierto ? undefined : ''}
      >
        <div className="menu-completo-foto" aria-hidden="true">
          {portadas.slice(0, enlaces.length).map((foto, indice) => (
            <img
              key={foto}
              src={foto}
              alt=""
              loading="lazy"
              className={indice === fotoMenu % Math.max(1, Math.min(portadas.length, enlaces.length)) ? 'activa' : undefined}
            />
          ))}
        </div>

        <nav className="menu-completo-principal" aria-label="Principal">
          {enlaces.map((enlace, indice) => (
            <NavLink
              key={enlace.destino}
              to={enlace.destino}
              end={enlace.fin}
              ref={indice === 0 ? primerEnlace : undefined}
              className={({ isActive }) => (isActive ? 'activo' : undefined)}
              style={{ '--i': indice }}
              onMouseEnter={() => setFotoMenu(indice)}
              onFocus={() => setFotoMenu(indice)}
            >
              <span className="menu-num">{String(indice + 1).padStart(2, '0')}</span>
              <span className="menu-texto">{enlace.texto}</span>
            </NavLink>
          ))}
        </nav>

        <div className="menu-completo-lateral">
          <span className="entradilla entradilla-clara">{t.menuDestinos}</span>
          <ul className="menu-ciudades">
            {ciudades.map((ciudad) => (
              <li key={ciudad.clave}>
                <Link to={`/tours?ciudad=${ciudad.clave}`}>
                  {ciudad.nombre} <small>{ciudad.cantidad}</small>
                </Link>
              </li>
            ))}
          </ul>

          <span className="entradilla entradilla-clara">{t.menuSiguenos}</span>
          <div className="menu-redes">
            <a href={SITIO.redes.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IconoInstagram /></a>
            <a href={SITIO.redes.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><IconoFacebook /></a>
            <a href={SITIO.redes.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><IconoTiktok /></a>
            <Link to="/panel" aria-label={t.navAdmin} title={t.navAdmin}><IconoUsuario /></Link>
          </div>
        </div>
      </div>
    </header>
  );
}
