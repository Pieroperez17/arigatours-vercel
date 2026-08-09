/**
 * Mapa de rutas de la aplicacion.
 *
 * Todas las paginas publicas comparten el mismo armazon (barra de navegacion
 * + pie de pagina) definido en <Disenio>. El panel de administracion vive en
 * /panel y esta protegido por <RutaProtegida>.
 */

import { Routes, Route } from 'react-router-dom';

import Disenio from './componentes/Disenio.jsx';
import RutaProtegida from './componentes/RutaProtegida.jsx';

import PaginaInicio from './paginas/PaginaInicio.jsx';
import PaginaTours from './paginas/PaginaTours.jsx';
import PaginaBlogs from './paginas/PaginaBlogs.jsx';
import PaginaQuienesSomos from './paginas/PaginaQuienesSomos.jsx';
import PaginaContacto from './paginas/PaginaContacto.jsx';
import PaginaPanel from './paginas/PaginaPanel.jsx';
import PaginaNoEncontrada from './paginas/PaginaNoEncontrada.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Disenio />}>
        <Route path="/" element={<PaginaInicio />} />

        {/* Una sola pagina de listado sirve para los tres catalogos:
            cambia el filtro por tipo y los textos de la cabecera. */}
        <Route path="/tours" element={<PaginaTours variante="todos" />} />
        <Route path="/tours-privados" element={<PaginaTours variante="privados" />} />
        <Route path="/free-walking-tours" element={<PaginaTours variante="gratuitos" />} />

        <Route path="/blogs" element={<PaginaBlogs />} />
        <Route path="/quienes-somos" element={<PaginaQuienesSomos />} />
        <Route path="/contacto" element={<PaginaContacto />} />

        <Route
          path="/panel"
          element={
            <RutaProtegida>
              <PaginaPanel />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<PaginaNoEncontrada />} />
      </Route>
    </Routes>
  );
}
