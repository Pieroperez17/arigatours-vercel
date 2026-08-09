/**
 * Panel de administracion.
 *
 * Si no hay sesion muestra el formulario de ingreso; si la hay, muestra las
 * tres secciones de gestion: tours, blogs y consultas recibidas.
 */

import { useState } from 'react';

import { usarSesion } from '../contexto/ContextoSesion.jsx';
import FormularioIngreso from '../componentes/panel/FormularioIngreso.jsx';
import GestionTours from '../componentes/panel/GestionTours.jsx';
import GestionBlogs from '../componentes/panel/GestionBlogs.jsx';
import GestionConsultas from '../componentes/panel/GestionConsultas.jsx';
import GestionSocios from '../componentes/panel/GestionSocios.jsx';

const SECCIONES = [
  { clave: 'tours', etiqueta: 'Tours', icono: 'fa-map-location-dot' },
  { clave: 'blogs', etiqueta: 'Blogs', icono: 'fa-newspaper' },
  { clave: 'consultas', etiqueta: 'Consultas', icono: 'fa-envelope-open-text' },
  { clave: 'contactos', etiqueta: 'Contactos', icono: 'fa-address-card' },
];

export default function PaginaPanel() {
  const { usuario, salir } = usarSesion();
  const [seccion, setSeccion] = useState('tours');

  if (!usuario) {
    return <FormularioIngreso />;
  }

  return (
    <div className="panel">
      <header className="panel-cabecera">
        <div>
          <h1>Panel de administración</h1>
          <p className="panel-usuario">
            <i className="fas fa-circle-user" /> {usuario.correo} · {usuario.rol}
          </p>
        </div>

        <button type="button" className="boton-contorno" onClick={salir}>
          <i className="fas fa-right-from-bracket" /> Cerrar sesión
        </button>
      </header>

      <nav className="panel-pestanias" aria-label="Secciones del panel">
        {SECCIONES.map((elemento) => (
          <button
            key={elemento.clave}
            type="button"
            className={`panel-pestania${seccion === elemento.clave ? ' activa' : ''}`}
            onClick={() => setSeccion(elemento.clave)}
          >
            <i className={`fas ${elemento.icono}`} /> {elemento.etiqueta}
          </button>
        ))}
      </nav>

      {seccion === 'tours' && <GestionTours />}
      {seccion === 'blogs' && <GestionBlogs />}
      {seccion === 'consultas' && <GestionConsultas />}
      {seccion === 'contactos' && <GestionSocios />}
    </div>
  );
}
