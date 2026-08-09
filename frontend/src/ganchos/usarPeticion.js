/**
 * Ganchos ("hooks") para pedir datos a la API sin repetir el mismo
 * patron de cargando / error / datos en cada pagina.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiTours, apiBlogs } from '../servicios/clienteApi.js';

/**
 * Gancho general: ejecuta una funcion asincrona y devuelve su estado.
 *
 * @param {Function} obtenerDatos  funcion que devuelve una promesa
 * @param {Array} dependencias     cuando cambian, se vuelve a pedir
 */
export function usarPeticion(obtenerDatos, dependencias = []) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Se guarda en una referencia para que cambiar la funcion no dispare
  // la peticion: solo las dependencias declaradas deben hacerlo.
  const referenciaObtener = useRef(obtenerDatos);
  referenciaObtener.current = obtenerDatos;

  const [contadorRecarga, setContadorRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;

    setCargando(true);
    setError(null);

    referenciaObtener
      .current()
      .then((resultado) => {
        if (!cancelado) setDatos(resultado);
      })
      .catch((fallo) => {
        if (!cancelado) setError(fallo.message || 'Error desconocido');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, contadorRecarga]);

  const recargar = useCallback(() => setContadorRecarga((valor) => valor + 1), []);

  return { datos, cargando, error, recargar };
}

/** Lista de tours en el idioma actual, opcionalmente filtrada por tipo. */
export function usarTours(idioma, tipo) {
  const { datos, cargando, error, recargar } = usarPeticion(
    () => apiTours.listar({ idioma, tipo }),
    [idioma, tipo]
  );

  return { tours: datos || [], cargando, error, recargar };
}

/** Lista de ciudades con tours, para el menu de navegacion. */
export function usarCiudades(idioma) {
  const { datos, cargando } = usarPeticion(() => apiTours.listarCiudades(idioma), [idioma]);
  return { ciudades: datos || [], cargando };
}

/** Lista de articulos del blog en el idioma actual. */
export function usarBlogs(idioma) {
  const { datos, cargando, error, recargar } = usarPeticion(
    () => apiBlogs.listar({ idioma }),
    [idioma]
  );

  return { blogs: datos || [], cargando, error, recargar };
}
