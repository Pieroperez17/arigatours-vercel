/**
 * Punto de entrada del frontend.
 * Monta React dentro de <div id="raiz"> y envuelve la aplicacion con los
 * proveedores de idioma y de sesion, que deben estar disponibles en todas
 * las paginas.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { ProveedorIdioma } from './contexto/ContextoIdioma.jsx';
import { ProveedorSesion } from './contexto/ContextoSesion.jsx';
import './estilos/global.css';
import './estilos/panel.css';

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorIdioma>
        <ProveedorSesion>
          <App />
        </ProveedorSesion>
      </ProveedorIdioma>
    </BrowserRouter>
  </StrictMode>
);
