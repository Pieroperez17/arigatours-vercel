/**
 * Indice de ciudades: una lista tipografica grande, una ciudad por fila.
 *
 * En escritorio, al pasar sobre una fila aparece la foto de esa ciudad y
 * sigue al cursor con un pequeno retraso, como si flotara. El movimiento se
 * escribe directamente en el estilo del marco dentro de un
 * requestAnimationFrame, sin pasar por el estado de React: repintar el
 * componente en cada movimiento del raton lo volvia a trompicones.
 *
 * En pantallas tactiles no hay cursor que seguir: cada fila lleva su propia
 * miniatura, que el CSS muestra solo ahi.
 */

import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import ConEnfasis from './ConEnfasis.jsx';
import { IconoFlecha } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { KANJI_CIUDAD } from '../configuracion/sitio.js';

// Cuanto se acerca la foto al cursor en cada fotograma (0-1). Menos es mas lento.
const SUAVIDAD = 0.14;

export default function IndiceCiudades({ ciudades }) {
  const { t } = usarIdioma();
  const [activa, setActiva] = useState(null);

  const marco = useRef(null);
  const destino = useRef({ x: 0, y: 0 });
  const posicion = useRef({ x: 0, y: 0 });
  const fotograma = useRef(0);

  useEffect(() => () => cancelAnimationFrame(fotograma.current), []);

  function animar() {
    const p = posicion.current;
    const d = destino.current;
    p.x += (d.x - p.x) * SUAVIDAD;
    p.y += (d.y - p.y) * SUAVIDAD;

    if (marco.current) {
      marco.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
    }

    if (Math.abs(d.x - p.x) > 0.5 || Math.abs(d.y - p.y) > 0.5) {
      fotograma.current = requestAnimationFrame(animar);
    } else {
      fotograma.current = 0;
    }
  }

  function alMover(evento) {
    const caja = evento.currentTarget.getBoundingClientRect();
    destino.current = { x: evento.clientX - caja.left, y: evento.clientY - caja.top };

    // La primera vez la foto aparece ya bajo el cursor, sin venir volando.
    if (activa === null) posicion.current = { ...destino.current };
    if (!fotograma.current) fotograma.current = requestAnimationFrame(animar);
  }

  if (ciudades.length === 0) return null;

  return (
    <section className="seccion indice">
      <div className="cabeza-lado revelar">
        <div>
          <div className="entradilla">{t.indiceEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.indiceTitulo} /></h2>
        </div>
        <Link to="/tours" className="enlace-flecha">{t.verTodos} <IconoFlecha tamano={18} /></Link>
      </div>

      <div className="indice-marco" onMouseMove={alMover} onMouseLeave={() => setActiva(null)}>
        <ol className="indice-lista">
          {ciudades.map((ciudad, indice) => (
            <li key={ciudad.clave} className="revelar">
              <Link
                to={`/tours?ciudad=${ciudad.clave}`}
                onMouseEnter={() => setActiva(indice)}
                onFocus={() => setActiva(indice)}
                onBlur={() => setActiva(null)}
                className={activa === indice ? 'activa' : undefined}
              >
                <span className="indice-num">{String(indice + 1).padStart(2, '0')}</span>
                <img className="indice-miniatura" src={ciudad.imagen} alt="" loading="lazy" />
                <span className="indice-nombre">{ciudad.nombre}</span>
                {KANJI_CIUDAD[ciudad.clave] && (
                  <span className="indice-kanji" aria-hidden="true">{KANJI_CIUDAD[ciudad.clave]}</span>
                )}
                <span className="indice-total">
                  {ciudad.total} {ciudad.total === 1 ? t.ciudadesTour : t.ciudadesTours}
                </span>
                <IconoFlecha tamano={22} />
              </Link>
            </li>
          ))}
        </ol>

        <div ref={marco} className={`indice-vista${activa !== null ? ' visible' : ''}`} aria-hidden="true">
          {ciudades.map((ciudad, indice) => (
            <img
              key={ciudad.clave}
              src={ciudad.imagen}
              alt=""
              loading="lazy"
              className={indice === activa ? 'activa' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
