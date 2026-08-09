/**
 * Carrusel de la pagina de inicio.
 *
 * Avanza solo cada 5 segundos y se puede mover con las flechas o los puntos.
 * Igual que en la web original, las fotos de fondo se barajan en cada visita
 * para que la portada no se vea siempre idéntica.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { FOTOS_PORTADA, recurso } from '../configuracion/sitio.js';

const SEGUNDOS_ENTRE_DIAPOSITIVAS = 5000;

/** Devuelve una copia barajada del arreglo (algoritmo de Fisher-Yates). */
function barajar(lista) {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
}

export default function CarruselPortada() {
  const { t } = usarIdioma();
  const [indiceActual, setIndiceActual] = useState(0);

  // useMemo sin dependencias: las fotos se barajan una sola vez por visita,
  // no en cada repintado.
  const fotos = useMemo(() => barajar(FOTOS_PORTADA).slice(0, 3), []);

  const diapositivas = useMemo(
    () => [
      { titulo: t.heroTitulo, texto: t.heroSubtitulo, boton: t.heroBoton, destino: '/tours' },
      { titulo: t.expTitulo, texto: t.expSubtitulo, boton: t.expBoton, destino: '/blogs' },
      { titulo: t.natTitulo, texto: t.natSubtitulo, boton: t.natBoton, destino: '/tours-privados' },
    ],
    [t]
  );

  const irA = useCallback(
    (indice) => setIndiceActual((indice + diapositivas.length) % diapositivas.length),
    [diapositivas.length]
  );

  // Avance automatico. El temporizador se reinicia cada vez que cambia el
  // indice, asi que al pulsar una flecha vuelve a contar desde cero.
  useEffect(() => {
    const temporizador = setInterval(
      () => setIndiceActual((actual) => (actual + 1) % diapositivas.length),
      SEGUNDOS_ENTRE_DIAPOSITIVAS
    );

    return () => clearInterval(temporizador);
  }, [indiceActual, diapositivas.length]);

  return (
    <section className="portada" aria-roledescription="carrusel">
      {diapositivas.map((diapositiva, indice) => (
        <div
          key={diapositiva.titulo}
          className={`portada-diapositiva${indice === indiceActual ? ' activa' : ''}`}
          style={{
            backgroundImage:
              `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${recurso(fotos[indice] || fotos[0])}')`,
          }}
          aria-hidden={indice !== indiceActual}
        >
          <div className="portada-contenido">
            {indice === 0 ? <h1>{diapositiva.titulo}</h1> : <h2>{diapositiva.titulo}</h2>}
            <p>{diapositiva.texto}</p>
            <Link to={diapositiva.destino} className="boton-primario">
              {diapositiva.boton}
            </Link>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="portada-flecha anterior"
        onClick={() => irA(indiceActual - 1)}
        aria-label={t.imagenAnterior}
      >
        ❮
      </button>

      <button
        type="button"
        className="portada-flecha siguiente"
        onClick={() => irA(indiceActual + 1)}
        aria-label={t.imagenSiguiente}
      >
        ❯
      </button>

      <div className="portada-puntos">
        {diapositivas.map((diapositiva, indice) => (
          <button
            key={diapositiva.titulo}
            type="button"
            className={`portada-punto${indice === indiceActual ? ' activo' : ''}`}
            onClick={() => irA(indice)}
            aria-label={`Diapositiva ${indice + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
