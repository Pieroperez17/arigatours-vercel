/**
 * Seccion "Mi cuenta" del panel: por ahora, cambiar la clave de acceso.
 */

import { useState } from 'react';

import { apiAutenticacion } from '../../servicios/clienteApi.js';
import { usarSesion } from '../../contexto/ContextoSesion.jsx';

// Mismo minimo que valida el backend. Se repite aqui para poder avisar
// mientras se escribe, sin esperar a que el servidor rechace el envio.
const LARGO_MINIMO = 12;

export default function GestionCuenta() {
  const { usuario } = usarSesion();

  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [claveRepetida, setClaveRepetida] = useState('');
  const [verClaves, setVerClaves] = useState(false);

  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cortaDeMas = claveNueva.length > 0 && claveNueva.length < LARGO_MINIMO;
  const noCoinciden = claveRepetida.length > 0 && claveNueva !== claveRepetida;

  async function guardar(evento) {
    evento.preventDefault();
    setError(null);
    setAviso(null);

    /*
     * Que las dos coincidan se comprueba solo aqui y no en el servidor: la
     * repeticion existe para atrapar una errata al teclear, no es un dato
     * que el backend necesite.
     */
    if (claveNueva !== claveRepetida) {
      setError('La clave nueva y su repetición no coinciden.');
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await apiAutenticacion.cambiarClave(claveActual, claveNueva);
      setAviso(respuesta.mensaje);
      setClaveActual('');
      setClaveNueva('');
      setClaveRepetida('');
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="panel-seccion">
      <div className="panel-barra">
        <h2>Mi cuenta</h2>
      </div>

      <form className="panel-formulario panel-formulario--estrecho" onSubmit={guardar}>
        <h3>Cambiar la clave de acceso</h3>

        <p className="panel-nota">
          Entras como <strong>{usuario?.correo}</strong>. La clave nueva se pide
          en el siguiente ingreso; la sesión abierta no se cierra.
        </p>

        {error && (
          <div className="panel-aviso error" role="alert">
            <i className="fas fa-circle-exclamation" /> {error}
          </div>
        )}

        {aviso && (
          <div className="panel-aviso exito" role="status">
            <i className="fas fa-circle-check" /> {aviso}
          </div>
        )}

        <div className="panel-campo">
          <label htmlFor="clave-actual">Clave actual *</label>
          <input
            id="clave-actual"
            type={verClaves ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={claveActual}
            onChange={(evento) => setClaveActual(evento.target.value)}
          />
        </div>

        <div className="panel-campo">
          <label htmlFor="clave-nueva">Clave nueva *</label>
          <input
            id="clave-nueva"
            type={verClaves ? 'text' : 'password'}
            required
            minLength={LARGO_MINIMO}
            autoComplete="new-password"
            value={claveNueva}
            onChange={(evento) => setClaveNueva(evento.target.value)}
          />
          <small className={cortaDeMas ? 'panel-texto-error' : undefined}>
            {cortaDeMas
              ? `Faltan ${LARGO_MINIMO - claveNueva.length} caracteres.`
              : `Mínimo ${LARGO_MINIMO} caracteres.`}
          </small>
        </div>

        <div className="panel-campo">
          <label htmlFor="clave-repetida">Repite la clave nueva *</label>
          <input
            id="clave-repetida"
            type={verClaves ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={claveRepetida}
            onChange={(evento) => setClaveRepetida(evento.target.value)}
          />
          {noCoinciden && <small className="panel-texto-error">No coincide con la anterior.</small>}
        </div>

        <div className="panel-campo panel-campo-casilla">
          <input
            id="ver-claves"
            type="checkbox"
            checked={verClaves}
            onChange={(evento) => setVerClaves(evento.target.checked)}
          />
          <label htmlFor="ver-claves">Mostrar las claves</label>
        </div>

        <div className="panel-acciones">
          <button
            type="submit"
            className="boton-primario"
            disabled={guardando || cortaDeMas || noCoinciden}
          >
            {guardando ? 'Guardando…' : 'Cambiar la clave'}
          </button>
        </div>
      </form>
    </section>
  );
}
