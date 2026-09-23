/**
 * Banda roja que encabeza las paginas interiores.
 *
 * El kanji gigante del fondo resume la pagina de un vistazo (旅, viaje; 話,
 * relato…) y el arco de la derecha muestra las fotos de portada que se
 * administran desde el panel: asi esa seccion del panel sigue teniendo
 * efecto aunque la portada de inicio lleve fotos del equipo fijas.
 *
 * Las fotos rotan cada 6 segundos con un fundido. Van todas apiladas y solo
 * cambia la opacidad: cambiar el src en su lugar dejaba un parpadeo en
 * blanco mientras la siguiente terminaba de cargar.
 */

import { useState, useEffect, useMemo } from 'react';
import ConEnfasis from './ConEnfasis.jsx';
import { usarPortadas } from '../ganchos/usarPortadas.js';

const SEGUNDOS_ENTRE_FOTOS = 6000;

export default function CabeceraPagina({ entradilla, titulo, subtitulo, kanji = '旅' }) {
  const portadas = usarPortadas();

  // Se barajan cuando cambia la lista, no en cada repintado.
  const fotos = useMemo(() => [...portadas].sort(() => Math.random() - 0.5).slice(0, 4), [portadas]);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (fotos.length < 2) return undefined;

    const temporizador = setInterval(
      () => setIndice((actual) => (actual + 1) % fotos.length),
      SEGUNDOS_ENTRE_FOTOS
    );

    return () => clearInterval(temporizador);
  }, [fotos.length]);

  return (
    <section className="banda">
      <span className="banda-kanji" aria-hidden="true">{kanji}</span>

      <div className="banda-texto">
        {entradilla && <div className="entradilla entradilla-clara">{entradilla}</div>}
        <h1><ConEnfasis texto={titulo} /></h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>

      {fotos.length > 0 && (
        <div className="banda-arco" aria-hidden="true">
          {fotos.map((foto, posicion) => (
            <img
              key={foto}
              src={foto}
              alt=""
              className={posicion === indice % fotos.length ? 'activa' : undefined}
              loading={posicion === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      )}
    </section>
  );
}
