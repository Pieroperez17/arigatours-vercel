/**
 * Mensajes de estado reutilizables: cargando, error y "sin resultados".
 * Evita repetir el mismo bloque de maquetado en cada pagina.
 */

import { usarIdioma } from '../contexto/ContextoIdioma.jsx';

/** El texto del boton de reintentar, en los tres idiomas. */
const REINTENTAR = { es: 'Reintentar', en: 'Retry', ja: '再試行' };

export function Cargando({ mensaje }) {
  return (
    <div className="estado" role="status" aria-live="polite">
      <div className="girador" />
      <p>{mensaje}</p>
    </div>
  );
}

export function ErrorCarga({ mensaje, alReintentar }) {
  const { idioma } = usarIdioma();

  return (
    <div className="estado error" role="alert">
      <p><i className="fas fa-triangle-exclamation" /> {mensaje}</p>

      {alReintentar && (
        <button type="button" className="boton-contorno" style={{ marginTop: '1rem' }} onClick={alReintentar}>
          <i className="fas fa-rotate-right" /> {REINTENTAR[idioma] || REINTENTAR.es}
        </button>
      )}
    </div>
  );
}

export function SinResultados({ mensaje }) {
  return (
    <div className="estado">
      <p><i className="far fa-face-frown" /> {mensaje}</p>
    </div>
  );
}
