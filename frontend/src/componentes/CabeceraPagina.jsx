/**
 * Portadilla de las paginas interiores: como la primera pagina de un
 * capitulo. A la izquierda la ruta, el titulo entrando por lineas y la
 * entradilla; a la derecha una foto de portada (las del panel, rotando) que
 * se descubre de abajo arriba; y en el borde, el kanji de la seccion en
 * vertical y en contorno.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import TituloPorLineas from './TituloPorLineas.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarPortadas } from '../ganchos/usarPortadas.js';

const SEGUNDOS_ENTRE_FOTOS = 6000;

export default function CabeceraPagina({ entradilla, titulo, subtitulo, kanji = '旅' }) {
  const { t } = usarIdioma();
  const portadas = usarPortadas();

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
    <section className="portadilla">
      <div className="portadilla-texto">
        <nav className="migas" aria-label="Ruta">
          <Link to="/">{t.navInicio}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{entradilla}</span>
        </nav>

        <h1><TituloPorLineas texto={titulo} /></h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>

      {fotos.length > 0 && (
        <div className="portadilla-foto" aria-hidden="true">
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

      <span className="portadilla-kanji" aria-hidden="true">{kanji}</span>
    </section>
  );
}
