/**
 * Pagina 404: cualquier direccion que no coincida con una ruta conocida.
 */

import { Link } from 'react-router-dom';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';

export default function PaginaNoEncontrada() {
  const { t } = usarIdioma();

  return (
    <div className="pagina-centrada">
      <span style={{ fontSize: '4rem' }}>🗺️</span>
      <h1>{t.noEncontradaTitulo}</h1>
      <p style={{ color: 'var(--texto-suave)' }}>{t.noEncontradaTexto}</p>

      <Link to="/" className="boton-primario">{t.volverInicio}</Link>
    </div>
  );
}
