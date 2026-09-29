/**
 * Ventana emergente (modal) donde se muestra el detalle de lo seleccionado.
 *
 * Sube desde abajo y ocupa la pantalla entera, como una pagina mas: asi se
 * abren la ficha de un tour y los articulos del diario, sin nada alrededor
 * que distraiga.
 *
 * El truco para poder animar la SALIDA es no desmontar la ventana de
 * inmediato: se mantiene en el DOM ("montado") mientras se reproduce la
 * animacion de cierre y solo despues se retira. El contenido se guarda en una
 * referencia para que no desaparezca a media animacion, ya que la pagina deja
 * de pasarlo en cuanto se deselecciona el elemento.
 *
 * Se cierra de tres formas: con el boton, pulsando Escape o haciendo clic
 * fuera de la ventana.
 */

import { useState, useEffect, useRef } from 'react';
import { usarBloqueoScroll } from '../ganchos/usarBloqueoScroll.js';
import { IconoCruz } from './Iconos.jsx';

/** Debe coincidir con la duracion de la salida de la ventana en global.css. */
const DURACION_SALIDA = 320;

export default function VentanaDetalle({
  abierto,
  alCerrar,
  clave,          // identificador de lo seleccionado: al cambiar, la ventana vuelve arriba
  titulo,
  children,
  textoCerrar = 'Cerrar',
}) {
  const [montado, setMontado] = useState(abierto);
  const [saliendo, setSaliendo] = useState(false);

  const referenciaVentana = useRef(null);
  const referenciaCerrar = useRef(null);
  const elementoPrevio = useRef(null);

  // Conserva el ultimo contenido recibido para seguir pintandolo durante la
  // animacion de salida, cuando "children" ya llega vacio.
  const contenidoVisible = useRef(children);
  if (abierto && children) contenidoVisible.current = children;

  usarBloqueoScroll(montado);

  useEffect(() => {
    if (abierto) {
      setSaliendo(false);
      setMontado(true);
      return undefined;
    }

    if (!montado) return undefined;

    setSaliendo(true);
    const temporizador = setTimeout(() => {
      setMontado(false);
      setSaliendo(false);
    }, DURACION_SALIDA);

    return () => clearTimeout(temporizador);
  }, [abierto, montado]);

  // Escape cierra la ventana.
  useEffect(() => {
    if (!abierto) return undefined;

    function alPulsarTecla(evento) {
      if (evento.key === 'Escape') alCerrar();
    }

    document.addEventListener('keydown', alPulsarTecla);
    return () => document.removeEventListener('keydown', alPulsarTecla);
  }, [abierto, alCerrar]);

  /*
   * Al abrir se lleva el foco al boton de cerrar y, al salir, se devuelve a la
   * tarjeta que abrio la ventana: asi no se pierde el sitio con el teclado.
   *
   * Depende de "montado" y no de "abierto": cuando "abierto" pasa a true la
   * ventana todavia no esta en el DOM (el montaje ocurre en el efecto de
   * arriba), asi que la referencia al boton seria null y el foco no se movria.
   */
  useEffect(() => {
    if (!montado) return undefined;

    elementoPrevio.current = document.activeElement;
    referenciaCerrar.current?.focus();

    return () => {
      if (elementoPrevio.current instanceof HTMLElement) {
        elementoPrevio.current.focus();
      }
    };
  }, [montado]);

  // Al cambiar de elemento sin cerrar, el contenido vuelve a su inicio.
  useEffect(() => {
    if (montado && clave) {
      referenciaVentana.current?.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [clave, montado]);

  if (!montado) return null;

  return (
    <div
      className={`ventana-fondo${saliendo ? ' saliendo' : ''}`}
      onClick={(evento) => { if (evento.target === evento.currentTarget) alCerrar(); }}
    >
      <div
        className={`ventana${saliendo ? ' saliendo' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo || textoCerrar}
        ref={referenciaVentana}
      >
        <button
          type="button"
          className="ventana-cerrar"
          onClick={alCerrar}
          aria-label={textoCerrar}
          title={textoCerrar}
          ref={referenciaCerrar}
        >
          <IconoCruz tamano={22} />
        </button>

        {contenidoVisible.current}
      </div>
    </div>
  );
}
