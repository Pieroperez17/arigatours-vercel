/**
 * Fila horizontal de tours de una misma ciudad, al estilo de las plataformas
 * de streaming: se desplaza con la rueda, con el dedo o arrastrando el raton.
 */

import { useRef } from 'react';

export default function FilaCiudad({
  ciudad,
  tours,
  tourSeleccionado,
  alSeleccionar,
  estado, // 'normal' | 'destacada' | 'atenuada'
  referenciaSeccion,
}) {
  const referenciaFila = useRef(null);

  // ── Arrastre con el raton (solo escritorio) ──
  const arrastre = useRef({ activo: false, inicioX: 0, desplazamientoInicial: 0, movio: false });

  function alPresionar(evento) {
    if (evento.button !== 0) return;

    const fila = referenciaFila.current;
    arrastre.current = {
      activo: true,
      inicioX: evento.pageX,
      desplazamientoInicial: fila.scrollLeft,
      movio: false,
    };
    fila.classList.add('arrastrando');
  }

  function alMover(evento) {
    if (!arrastre.current.activo) return;

    const distancia = (evento.pageX - arrastre.current.inicioX) * 1.4;
    if (Math.abs(distancia) > 5) arrastre.current.movio = true;

    referenciaFila.current.scrollLeft = arrastre.current.desplazamientoInicial - distancia;
  }

  function alSoltar() {
    arrastre.current.activo = false;
    referenciaFila.current?.classList.remove('arrastrando');
  }

  /** Si el usuario estaba arrastrando, el clic no debe abrir el tour. */
  function manejarClicTarjeta(tour) {
    if (arrastre.current.movio) {
      arrastre.current.movio = false;
      return;
    }
    alSeleccionar(tour);
  }

  return (
    <section
      className={`fila-ciudad${estado === 'destacada' ? ' destacada' : ''}${estado === 'atenuada' ? ' atenuada' : ''}`}
      ref={referenciaSeccion}
    >
      <h2 className="fila-titulo">{ciudad}</h2>

      <div
        className="fila-tarjetas"
        ref={referenciaFila}
        onMouseDown={alPresionar}
        onMouseMove={alMover}
        onMouseUp={alSoltar}
        onMouseLeave={alSoltar}
      >
        {tours.map((tour) => (
          <button
            key={tour.id}
            type="button"
            className={`tarjeta-tour${tourSeleccionado === tour.id ? ' seleccionada' : ''}`}
            onClick={() => manejarClicTarjeta(tour)}
          >
            <div className="tarjeta-tour-imagen">
              <img src={tour.imagen} alt={tour.titulo} loading="lazy" draggable="false" />

              <div className="tarjeta-tour-texto">
                {tour.tematica && <span className="insignia">{tour.tematica}</span>}
                <h3>{tour.titulo}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
