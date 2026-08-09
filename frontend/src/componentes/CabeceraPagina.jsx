/**
 * Cabecera con imagen de fondo que encabeza las paginas interiores.
 * La foto va cambiando cada 6 segundos, como en la web original.
 */

import { useState, useEffect, useMemo } from 'react';
import { FOTOS_PORTADA, recurso } from '../configuracion/sitio.js';

const SEGUNDOS_ENTRE_FOTOS = 6000;

export default function CabeceraPagina({ titulo, subtitulo }) {
  const fotos = useMemo(() => [...FOTOS_PORTADA].sort(() => Math.random() - 0.5), []);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const temporizador = setInterval(
      () => setIndice((actual) => (actual + 1) % fotos.length),
      SEGUNDOS_ENTRE_FOTOS
    );

    return () => clearInterval(temporizador);
  }, [fotos.length]);

  return (
    <section
      className="cabecera-pagina"
      style={{
        backgroundImage:
          `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${recurso(fotos[indice])}')`,
      }}
    >
      <h1>{titulo}</h1>
      {subtitulo && <p>{subtitulo}</p>}
    </section>
  );
}
