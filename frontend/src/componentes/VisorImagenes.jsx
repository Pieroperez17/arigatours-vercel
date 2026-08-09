/**
 * Visor de imagenes a pantalla completa (lightbox).
 *
 * Se cierra con Escape o pulsando el fondo, y se navega con las flechas del
 * teclado. Mientras esta abierto se bloquea el desplazamiento de la pagina.
 */

import { useEffect, useCallback } from 'react';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarBloqueoScroll } from '../ganchos/usarBloqueoScroll.js';

export default function VisorImagenes({ imagenes, indice, alCambiar, alCerrar }) {
  const { t } = usarIdioma();

  const anterior = useCallback(
    () => alCambiar((indice - 1 + imagenes.length) % imagenes.length),
    [indice, imagenes.length, alCambiar]
  );

  const siguiente = useCallback(
    () => alCambiar((indice + 1) % imagenes.length),
    [indice, imagenes.length, alCambiar]
  );

  // El bloqueo del fondo se delega al gancho compartido: este visor puede
  // abrirse desde dentro de la ventana de detalle, y al cerrarlo el fondo debe
  // seguir bloqueado porque la ventana continua abierta.
  usarBloqueoScroll(true);

  useEffect(() => {
    function alPulsarTecla(evento) {
      if (evento.key === 'ArrowLeft') anterior();
      if (evento.key === 'ArrowRight') siguiente();

      if (evento.key === 'Escape') {
        // El visor puede estar abierto encima de la ventana de detalle, que
        // tambien escucha Escape en "document". Como los dos escuchan en el
        // mismo nodo, stopPropagation no bastaria: hay que registrarse en fase
        // de captura (se ejecuta antes) y cortar ahi la cadena, para que
        // Escape cierre solo el visor y no las dos capas a la vez.
        evento.stopImmediatePropagation();
        alCerrar();
      }
    }

    document.addEventListener('keydown', alPulsarTecla, true);
    return () => document.removeEventListener('keydown', alPulsarTecla, true);
  }, [alCerrar, anterior, siguiente]);

  if (imagenes.length === 0) return null;

  const hayVarias = imagenes.length > 1;

  return (
    <div
      className="visor"
      role="dialog"
      aria-modal="true"
      aria-label={t.cerrarGaleria}
      onClick={(evento) => { if (evento.target === evento.currentTarget) alCerrar(); }}
    >
      <button type="button" className="visor-boton cerrar" onClick={alCerrar} aria-label={t.cerrarGaleria}>
        ×
      </button>

      {hayVarias && (
        <button type="button" className="visor-boton anterior" onClick={anterior} aria-label={t.imagenAnterior}>
          ❮
        </button>
      )}

      <img className="visor-imagen" src={imagenes[indice]} alt={`${indice + 1} / ${imagenes.length}`} />

      {hayVarias && (
        <button type="button" className="visor-boton siguiente" onClick={siguiente} aria-label={t.imagenSiguiente}>
          ❯
        </button>
      )}
    </div>
  );
}
