/**
 * Carrusel horizontal reutilizable.
 *
 * Es la misma interaccion que ya usaban las filas de tours -se mueve con el
 * dedo, con la rueda o arrastrando el raton- pero suelta del contenido: aqui
 * lo que se pinta dentro lo decide quien lo usa. Lo comparten la fila de
 * ciudades y la de blogs del inicio.
 *
 * Anade flechas a los lados, que aparecen solo cuando hay algo hacia ese
 * lado: en escritorio no hay nada que insinue que una fila se desplaza si no
 * se ve el borde de la siguiente tarjeta.
 */

import { useRef, useState, useEffect, useCallback } from 'react';

import ConEnfasis from './ConEnfasis.jsx';
import { IconoAnterior, IconoSiguiente } from './Iconos.jsx';

export default function CarruselHorizontal({ titulo, entradilla, extra, clase = '', children }) {
  const pista = useRef(null);
  const [puedeIzquierda, setPuedeIzquierda] = useState(false);
  const [puedeDerecha, setPuedeDerecha] = useState(false);

  const revisarBordes = useCallback(() => {
    const nodo = pista.current;
    if (!nodo) return;

    // El margen de 4 px evita que la flecha parpadee por decimales del scroll.
    setPuedeIzquierda(nodo.scrollLeft > 4);
    setPuedeDerecha(nodo.scrollLeft + nodo.clientWidth < nodo.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return undefined;

    revisarBordes();
    nodo.addEventListener('scroll', revisarBordes, { passive: true });
    window.addEventListener('resize', revisarBordes);

    /*
     * El contenido llega de la API, asi que al montar la pista puede estar
     * vacia y medir cero. Sin observar los cambios de tamanio, las flechas se
     * quedarian ocultas para siempre aunque despues entren diez tarjetas.
     */
    const observador = new ResizeObserver(revisarBordes);
    observador.observe(nodo);

    return () => {
      nodo.removeEventListener('scroll', revisarBordes);
      window.removeEventListener('resize', revisarBordes);
      observador.disconnect();
    };
  }, [revisarBordes, children]);

  /** Avanza o retrocede algo menos de una pantalla, para dejar contexto. */
  function desplazar(direccion) {
    const nodo = pista.current;
    if (!nodo) return;
    nodo.scrollBy({ left: direccion * nodo.clientWidth * 0.8, behavior: 'smooth' });
  }

  // ── Arrastre con el raton, igual que en las filas de tours ──
  const arrastre = useRef({ activo: false, inicioX: 0, desplazamientoInicial: 0 });

  function alPresionar(evento) {
    if (evento.button !== 0) return;
    arrastre.current = {
      activo: true,
      inicioX: evento.pageX,
      desplazamientoInicial: pista.current.scrollLeft,
    };
    pista.current.classList.add('arrastrando');
  }

  function alMover(evento) {
    if (!arrastre.current.activo) return;
    const distancia = (evento.pageX - arrastre.current.inicioX) * 1.4;
    pista.current.scrollLeft = arrastre.current.desplazamientoInicial - distancia;
  }

  function alSoltar() {
    arrastre.current.activo = false;
    pista.current?.classList.remove('arrastrando');
  }

  return (
    <section className={`carrusel-seccion ${clase}`.trim()}>
      <header className="carrusel-cabecera revelar">
        <div>
          {entradilla && <div className="entradilla">{entradilla}</div>}
          <h2 className="titulo-seccion"><ConEnfasis texto={titulo} /></h2>
        </div>
        {extra}
      </header>

      <div className="carrusel-marco">
        <button
          type="button"
          className={`carrusel-flecha izquierda${puedeIzquierda ? '' : ' oculta'}`}
          onClick={() => desplazar(-1)}
          aria-label="Ver anteriores"
          tabIndex={puedeIzquierda ? 0 : -1}
        >
          <IconoAnterior tamano={22} />
        </button>

        <div
          className="carrusel-pista"
          ref={pista}
          onMouseDown={alPresionar}
          onMouseMove={alMover}
          onMouseUp={alSoltar}
          onMouseLeave={alSoltar}
        >
          {children}
        </div>

        <button
          type="button"
          className={`carrusel-flecha derecha${puedeDerecha ? '' : ' oculta'}`}
          onClick={() => desplazar(1)}
          aria-label="Ver siguientes"
          tabIndex={puedeDerecha ? 0 : -1}
        >
          <IconoSiguiente tamano={22} />
        </button>
      </div>
    </section>
  );
}
