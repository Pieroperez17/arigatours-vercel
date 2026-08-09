/**
 * Contexto de sesion del panel de administracion.
 *
 * Al arrancar comprueba si hay un token guardado y valido; si lo hay,
 * pregunta al backend por el perfil para confirmarlo. Expone:
 *   · usuario     → datos del administrador o null
 *   · comprobando → true mientras verifica el token al cargar
 *   · ingresar / salir
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  apiAutenticacion,
  guardarToken,
  obtenerToken,
  borrarToken,
  tokenExpirado,
} from '../servicios/clienteApi.js';

const ContextoSesion = createContext(null);

export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [comprobando, setComprobando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function validarSesionGuardada() {
      const token = obtenerToken();

      // Sin token, o caducado: no hace falta molestar al servidor.
      if (!token || tokenExpirado(token)) {
        borrarToken();
        if (!cancelado) setComprobando(false);
        return;
      }

      try {
        const datos = await apiAutenticacion.perfil();
        if (!cancelado) setUsuario(datos.usuario);
      } catch {
        borrarToken();
        if (!cancelado) setUsuario(null);
      } finally {
        if (!cancelado) setComprobando(false);
      }
    }

    validarSesionGuardada();
    return () => { cancelado = true; };
  }, []);

  const ingresar = useCallback(async (correo, clave) => {
    const datos = await apiAutenticacion.ingresar(correo, clave);
    guardarToken(datos.token);
    setUsuario(datos.usuario);
    return datos.usuario;
  }, []);

  const salir = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, comprobando, ingresar, salir }),
    [usuario, comprobando, ingresar, salir]
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

/** Gancho para leer la sesion desde cualquier componente. */
export function usarSesion() {
  const contexto = useContext(ContextoSesion);

  if (!contexto) {
    throw new Error('usarSesion debe usarse dentro de <ProveedorSesion>.');
  }

  return contexto;
}
