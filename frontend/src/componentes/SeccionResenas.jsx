/**
 * Reseñas de una en una, en grande, como una cita en una revista.
 *
 * Pasan solas cada 8 segundos y se pueden mover con las flechas. Se paran
 * mientras el raton o el foco estan dentro: nadie quiere que el texto que
 * esta leyendo se cambie a media frase.
 *
 * Al lado, la nota de Tripadvisor enlazada a la ficha publica, que es el
 * respaldo de lo que se cita.
 */

import { useState, useEffect } from 'react';

import ConEnfasis from './ConEnfasis.jsx';
import { Estrellas, IconoAnterior, IconoSiguiente, IconoFlecha } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { SITIO } from '../configuracion/sitio.js';

const SEGUNDOS_POR_RESENA = 8000;
const dosCifras = (numero) => String(numero).padStart(2, '0');

export default function SeccionResenas({ resenas }) {
  const { t } = usarIdioma();
  const [actual, setActual] = useState(0);
  const [pausada, setPausada] = useState(false);

  const total = resenas.length;

  useEffect(() => {
    if (pausada || total < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const temporizador = setTimeout(() => setActual((valor) => (valor + 1) % total), SEGUNDOS_POR_RESENA);
    return () => clearTimeout(temporizador);
  }, [actual, pausada, total]);

  if (total === 0) return null;

  const resena = resenas[actual];
  const mover = (paso) => setActual((valor) => (valor + paso + total) % total);

  return (
    <section
      className="testimonios"
      onMouseEnter={() => setPausada(true)}
      onMouseLeave={() => setPausada(false)}
      onFocus={() => setPausada(true)}
      onBlur={() => setPausada(false)}
    >
      <div className="testimonios-lado revelar">
        <div className="entradilla entradilla-clara">{t.resenasEntradilla}</div>
        <h2 className="titulo-seccion"><ConEnfasis texto={t.resenasTitulo} /></h2>

        <a className="testimonios-nota" href={SITIO.resenas.tripadvisor} target="_blank" rel="noreferrer">
          <b>{SITIO.resenas.notaTripadvisor.toFixed(1)}</b>
          <span>
            <Estrellas tamano={16} />
            <small>{SITIO.resenas.totalTripadvisor} {t.resenasOpiniones}</small>
          </span>
        </a>
      </div>

      <div className="testimonios-cita">
        {/* La clave recrea la cita en cada cambio para repetir su entrada */}
        <figure key={resena.id} className="testimonio">
          <span className="testimonio-comilla" aria-hidden="true">“</span>
          <blockquote>{resena.texto}</blockquote>
          <figcaption>
            <b>{resena.autor}</b>
            {resena.detalle && <span>{resena.detalle}</span>}
            <span className="testimonio-fuente">
              {resena.fuente === 'tripadvisor' ? 'Tripadvisor' : t.resenasFuenteGw}
            </span>
          </figcaption>
        </figure>

        <div className="testimonios-controles">
          <button type="button" className="boton-circular" onClick={() => mover(-1)} aria-label={t.resenaAnterior}>
            <IconoAnterior tamano={20} />
          </button>
          <span className="testimonios-cuenta">
            <b>{dosCifras(actual + 1)}</b> / {dosCifras(total)}
          </span>
          <button type="button" className="boton-circular" onClick={() => mover(1)} aria-label={t.resenaSiguiente}>
            <IconoSiguiente tamano={20} />
          </button>

          <a className="enlace-flecha" href={SITIO.resenas.tripadvisor} target="_blank" rel="noreferrer">
            {t.resenasLeerTripadvisor} <IconoFlecha tamano={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
