/**
 * Barra de navegacion fija.
 *
 * En escritorio los menus se abren al pasar el raton (solo CSS).
 * En movil se convierte en un panel lateral con acordeones, controlado
 * desde React con el estado "menuAbierto" / "desplegableAbierto".
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
import { SITIO } from '../configuracion/sitio.js';

export default function BarraNavegacion() {
  const { idioma, cambiarIdioma, t } = usarIdioma();
  const { usuario } = usarSesion();
  const { ciudades } = usarCiudades(idioma);
  const ubicacion = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [desplegableAbierto, setDesplegableAbierto] = useState(null);

  // Al navegar a otra pagina el menu movil se cierra solo.
  useEffect(() => {
    setMenuAbierto(false);
    setDesplegableAbierto(null);
  }, [ubicacion.pathname, ubicacion.search]);

  // Si la ventana crece hasta tamanio escritorio, se cierra el panel lateral.
  useEffect(() => {
    function alRedimensionar() {
      if (window.innerWidth > 992) {
        setMenuAbierto(false);
        setDesplegableAbierto(null);
      }
    }

    window.addEventListener('resize', alRedimensionar);
    return () => window.removeEventListener('resize', alRedimensionar);
  }, []);

  // Bloquea el desplazamiento del fondo mientras el panel lateral esta abierto.
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAbierto]);

  /** En movil el boton abre el acordeon; en escritorio no hace nada (usa hover). */
  function alternarDesplegable(nombre) {
    if (window.innerWidth > 992) return;
    setDesplegableAbierto((actual) => (actual === nombre ? null : nombre));
  }

  const claseEnlace = ({ isActive }) => (isActive ? 'activo' : undefined);

  return (
    <>
      <header className="navbar">
        <Link to="/" className="navbar-logo" aria-label={SITIO.nombre}>
          <img src={SITIO.logo} alt={`Logo ${SITIO.nombre}`} />
        </Link>

        <nav className={`navegacion${menuAbierto ? ' abierta' : ''}`} aria-label="Principal">
          <ul className="navegacion-lista">
            <li>
              <NavLink to="/" className={claseEnlace} end>{t.navInicio}</NavLink>
            </li>

            {/* Ciudades: se arma con los datos reales de la base */}
            <li className={`desplegable${desplegableAbierto === 'ciudades' ? ' abierto' : ''}`}>
              <button
                type="button"
                className="desplegable-boton"
                onClick={() => alternarDesplegable('ciudades')}
                aria-expanded={desplegableAbierto === 'ciudades'}
              >
                <span>{t.navCiudades}</span>
                <span className="desplegable-flecha" aria-hidden="true">▼</span>
              </button>

              <div className="desplegable-menu">
                {ciudades.map((ciudad) => (
                  <Link key={ciudad.clave} to={`/tours?ciudad=${ciudad.clave}`}>
                    {ciudad.nombre} <span style={{ color: '#aaa' }}>({ciudad.cantidad})</span>
                  </Link>
                ))}
                <Link to="/tours">{t.navTodasCiudades}</Link>
              </div>
            </li>

            <li className={`desplegable${desplegableAbierto === 'privados' ? ' abierto' : ''}`}>
              <button
                type="button"
                className="desplegable-boton"
                onClick={() => alternarDesplegable('privados')}
                aria-expanded={desplegableAbierto === 'privados'}
              >
                <span>{t.navToursPrivados}</span>
                <span className="desplegable-flecha" aria-hidden="true">▼</span>
              </button>

              <div className="desplegable-menu">
                <Link to="/tours-privados">{t.navTodasCiudades}</Link>
                {ciudades.map((ciudad) => (
                  <Link key={ciudad.clave} to={`/tours-privados?ciudad=${ciudad.clave}`}>
                    {ciudad.nombre}
                  </Link>
                ))}
              </div>
            </li>

            <li>
              <NavLink to="/free-walking-tours" className={claseEnlace}>{t.navFreeTours}</NavLink>
            </li>
            <li>
              <NavLink to="/blogs" className={claseEnlace}>{t.navBlogs}</NavLink>
            </li>
            <li>
              <NavLink to="/quienes-somos" className={claseEnlace}>{t.navQuienesSomos}</NavLink>
            </li>
            <li>
              <NavLink to="/contacto" className={claseEnlace}>{t.navContacto}</NavLink>
            </li>
          </ul>
        </nav>

        <div className="navbar-acciones">
          <div className="selector-idioma">
            <select
              value={idioma}
              onChange={(evento) => cambiarIdioma(evento.target.value)}
              aria-label="Idioma"
            >
              {IDIOMAS.map((elemento) => (
                <option key={elemento.codigo} value={elemento.codigo}>
                  {elemento.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/panel"
            className="boton-panel"
            title={usuario ? `${t.navAdmin} · ${usuario.correo}` : t.navAdmin}
            aria-label={t.navAdmin}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          className="boton-hamburguesa"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-label={menuAbierto ? t.cerrarMenu : t.abrirMenu}
          aria-expanded={menuAbierto}
        >
          <i className={menuAbierto ? 'fas fa-times' : 'fas fa-bars'} />
        </button>
      </header>

      <div
        className={`capa-oscura${menuAbierto ? ' visible' : ''}`}
        onClick={() => setMenuAbierto(false)}
        aria-hidden="true"
      />
    </>
  );
}
