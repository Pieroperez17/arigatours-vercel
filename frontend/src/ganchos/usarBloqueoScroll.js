/**
 * Bloquea el desplazamiento del fondo mientras hay una capa abierta
 * (ventana de detalle, visor de imagenes, menu movil...).
 *
 * Se lleva una cuenta compartida a proposito: si el visor de imagenes se abre
 * DENTRO de la ventana de detalle, al cerrar el visor no debe desbloquearse el
 * fondo, porque la ventana sigue abierta. Solo se libera cuando se cierra la
 * ultima capa.
 */

import { useEffect } from 'react';

let capasAbiertas = 0;
let desplazamientoOriginal = '';

export function usarBloqueoScroll(activo) {
  useEffect(() => {
    if (!activo) return undefined;

    if (capasAbiertas === 0) {
      desplazamientoOriginal = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    capasAbiertas += 1;

    return () => {
      capasAbiertas -= 1;

      if (capasAbiertas === 0) {
        document.body.style.overflow = desplazamientoOriginal;
      }
    };
  }, [activo]);
}
