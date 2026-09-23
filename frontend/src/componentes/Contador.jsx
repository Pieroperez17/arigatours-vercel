/**
 * Cifra que cuenta desde cero hasta su valor la primera vez que asoma en
 * pantalla. El valor final ya esta en el HTML desde el principio (y es lo
 * que leen los lectores de pantalla): la cuenta es solo lo que se ve.
 */

import { useEffect, useRef, useState } from 'react';

const DURACION_MS = 1400;

export default function Contador({ valor }) {
  const nodo = useRef(null);
  const [mostrado, setMostrado] = useState(valor);

  useEffect(() => {
    const elemento = nodo.current;
    const pideMenos = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!elemento || pideMenos || !('IntersectionObserver' in window) || valor === 0) {
      setMostrado(valor);
      return undefined;
    }

    let fotograma = 0;
    setMostrado(0);

    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return;
      observador.disconnect();

      const inicio = performance.now();
      const paso = (ahora) => {
        const avance = Math.min(1, (ahora - inicio) / DURACION_MS);
        // Frena al final: cubica de salida.
        const suavizado = 1 - (1 - avance) ** 3;
        setMostrado(Math.round(valor * suavizado));
        if (avance < 1) fotograma = requestAnimationFrame(paso);
      };
      fotograma = requestAnimationFrame(paso);
    }, { threshold: 0.6 });

    observador.observe(elemento);

    return () => {
      observador.disconnect();
      cancelAnimationFrame(fotograma);
    };
  }, [valor]);

  return (
    <span ref={nodo}>
      <span className="solo-lector">{valor}</span>
      <span aria-hidden="true">{mostrado}</span>
    </span>
  );
}
