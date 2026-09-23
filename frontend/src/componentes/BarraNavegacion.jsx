/**
 * Cabecera fija, blanca y translucida.
 *
 * En escritorio el menu de destinos se abre al pasar el raton (solo CSS).
 * Por debajo de 1180 px la navegacion se pliega en un panel que cae bajo la
 * barra, y ahi los destinos se abren con un boton, como acordeon.
 *
 * La lista de ciudades NO esta escrita a mano: se pide a /api/tours/ciudades,
 * asi que cuando se agrega un tour de una ciudad nueva, el menu se actualiza
 * solo sin tocar el codigo.
 */

import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarSesion } from '../contexto/ContextoSesion.jsx';
import { usarCiudades } from '../ganchos/usarPeticion.js';
import { IDIOMAS } from '../traducciones/textos.js';
import { SITIO, enlaceWhatsapp } from '../configuracion/sitio.js';
import { IconoMenu, IconoCruz, IconoUsuario } from './Iconos.jsx';

// Debe coincidir con el punto de corte de ".menu" en global.css.
const ANCHO_PLEGADO = 1180;

export default function BarraNavegacion() {
  const { idioma, cambiarIdioma, t } = usarIdioma();
  const { usuario } = usarSesion();
  const { ciudades } = usarCiudades(idioma);
  const ubicacion = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [destinosAbiertos, setDestinosAbiertos] = useState(false);
  const [desplazado, setDesplazado] = useState(false);

  // Al navegar a otra pagina el menu movil se cierra solo.
  useEffect(() => {
    setMenuAbierto(false);
    setDestinosAbiertos(false);
  }, [ubicacion.pathname, ubicacion.search]);

  // Si la ventana crece hasta tamanio escritorio, se cierra el panel.
  useEffect(() => {
    function alRedimensionar() {
      if (window.innerWidth > ANCHO_PLEGADO) setMenuAbierto(false);
    }

    window.addEventListener('resize', alRedimensionar);
    return () => window.removeEventListener('resize', alRedimensionar);
  }, []);

  // Una linea de sombra aparece en cuanto la pagina deja de estar arriba del
  // todo: sobre el blanco del contenido, la barra dejaria de distinguirse.
  useEffect(() => {
    function alDesplazar() {
      setDesplazado(window.scrollY > 8);
    }

    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, []);

  // Con el panel abierto en movil no se desplaza el fondo.
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAbierto]);

  const claseEnlace = ({ isActive }) => (isActive ? 'activo' : undefined);

  return (
    <header className={`cabecera${desplazado ? ' desplazada' : ''}`}>
      <div className="cabecera-barra">
        <Link to="/" className="cabecera-logo" aria-label={SITIO.nombre}>
          <img src={SITIO.logo} alt={SITIO.nombre} width="160" height="64" />
        </Link>

        <nav
          id="menu-principal"
          className={`menu${menuAbierto ? ' abierto' : ''}`}
          aria-label="Principal"
        >
          <NavLink to="/" className={claseEnlace} end>{t.navInicio}</NavLink>

          <div className={`menu-destinos${destinosAbiertos ? ' abierto' : ''}`}>
            <div className="menu-destinos-fila">
              <NavLink to="/tours" className={claseEnlace}>{t.navDestinos}</NavLink>

              {/* Solo visible en el panel plegado: en escritorio abre el hover */}
              <button
                type="button"
                className="menu-destinos-boton"
                onClick={() => setDestinosAbiertos((abierto) => !abierto)}
                aria-expanded={destinosAbiertos}
                aria-label={t.navCiudades}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>

            <div className="menu-destinos-panel">
              {ciudades.map((ciudad) => (
                <Link key={ciudad.clave} to={`/tours?ciudad=${ciudad.clave}`}>
                  <span>{ciudad.nombre}</span>
                  <small>{ciudad.cantidad}</small>
                </Link>
              ))}
              <Link to="/tours" className="menu-destinos-todos">{t.navTodasCiudades} →</Link>
            </div>
          </div>

          <NavLink to="/tours-privados" className={claseEnlace}>{t.navToursPrivados}</NavLink>
          <NavLink to="/free-walking-tours" className={claseEnlace}>{t.navFreeTours}</NavLink>
          <NavLink to="/quienes-somos" className={claseEnlace}>{t.navQuienesSomos}</NavLink>
          <NavLink to="/blogs" className={claseEnlace}>{t.navBlogs}</NavLink>
          <NavLink to="/contacto" className={claseEnlace}>{t.navContacto}</NavLink>
        </nav>

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
            className="boton boton-solido cabecera-reservar"
            href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
            target="_blank"
            rel="noreferrer"
          >
            {t.reservar}
          </a>

          <Link
            to="/panel"
            className="boton-circular cabecera-panel"
            title={usuario ? `${t.navAdmin} · ${usuario.correo}` : t.navAdmin}
            aria-label={t.navAdmin}
          >
            <IconoUsuario tamano={18} />
          </Link>

          <button
            type="button"
            className="boton-circular cabecera-menu"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-label={menuAbierto ? t.cerrarMenu : t.abrirMenu}
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
          >
            {menuAbierto ? <IconoCruz tamano={22} /> : <IconoMenu tamano={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
