/**
 * Cabecera con imagen de fondo que encabeza las paginas interiores.
 * La foto va cambiando cada 6 segundos, como en la web original.
 */

import { useState, useEffect, useMemo } from 'react';
import { usarPortadas } from '../ganchos/usarPortadas.js';

const SEGUNDOS_ENTRE_FOTOS = 6000;

export default function CabeceraPagina({ titulo, subtitulo }) {
  const portadas = usarPortadas();

  // Se barajan cuando cambia la lista, no en cada repintado.
  const fotos = useMemo(() => [...portadas].sort(() => Math.random() - 0.5), [portadas]);
  const [indice, setIndice] = useState(0);

  /*
   * Si el administrador quita fotos, el indice puede quedar apuntando mas
   * alla del final de la lista nueva y la cabecera se veria sin fondo. El
   * resto (%) lo devuelve dentro del rango.
   */
  const fotoActual = fotos[indice % fotos.length];

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
          `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${fotoActual}')`,
      }}
    >
      <h1>{titulo}</h1>
      {subtitulo && <p>{subtitulo}</p>}
    </section>
  );
}
