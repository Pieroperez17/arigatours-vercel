/**
 * Fotos de fondo del carrusel de inicio y de las cabeceras interiores.
 *
 * Antes eran una lista fija en el codigo; ahora se administran desde el panel
 * y llegan por la API. Este gancho envuelve esa llamada y resuelve dos cosas
 * que, mal hechas, se notan mucho en pantalla.
 */

import { useState, useEffect } from 'react';

import { apiPortadas } from '../servicios/clienteApi.js';
import { FOTOS_PORTADA, recurso } from '../configuracion/sitio.js';

/*
 * Respaldo: las mismas fotos que habia escritas a mano, ya como rutas
 * publicas. Se usan mientras la peticion viaja y tambien si falla.
 *
 * La portada es lo primero que ve quien entra, y es a pantalla completa:
 * esperar a la API dejaria un rectangulo negro los primeros cientos de
 * milisegundos, y un fallo de red lo dejaria negro para siempre. Con el
 * respaldo, lo peor que pasa es que se vean las fotos de siempre.
 */
const RESPALDO = FOTOS_PORTADA.map(recurso);

/*
 * La peticion se guarda a nivel de modulo, no dentro del gancho.
 *
 * El carrusel y la cabecera lo llaman por separado, y sin esto cada montaje
 * dispararia su propia llamada para pedir exactamente lo mismo. Guardando la
 * promesa, la primera la lanza y las demas se cuelgan de ella.
 */
let peticionEnCurso = null;

function pedirPortadas() {
  if (!peticionEnCurso) {
    peticionEnCurso = apiPortadas
      .listar()
      .then((filas) => filas.map((fila) => fila.imagen).filter(Boolean))
      .catch(() => []);   // el gancho decide que hacer con la lista vacia
  }

  return peticionEnCurso;
}

/** Compara dos listas de rutas sin importar el orden. */
function mismasFotos(a, b) {
  if (a.length !== b.length) return false;
  const conjunto = new Set(a);
  return b.every((foto) => conjunto.has(foto));
}

export function usarPortadas() {
  const [fotos, setFotos] = useState(RESPALDO);

  useEffect(() => {
    let vigente = true;

    pedirPortadas().then((lista) => {
      if (!vigente || lista.length === 0) return;

      /*
       * Solo se cambia el estado si la lista es realmente distinta.
       *
       * Mientras nadie toque el panel, la de la base y el respaldo son las
       * mismas nueve fotos. Sin esta comparacion se volveria a barajar al
       * llegar la respuesta y la portada cambiaria de imagen sola, a la
       * vista del visitante, sin que nada haya cambiado.
       */
      setFotos((actuales) => (mismasFotos(actuales, lista) ? actuales : lista));
    });

    return () => { vigente = false; };
  }, []);

  return fotos;
}
