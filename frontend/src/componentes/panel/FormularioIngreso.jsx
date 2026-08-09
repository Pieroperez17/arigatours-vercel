/**
 * Formulario de ingreso al panel de administracion.
 */

import { useState } from 'react';
import { usarSesion } from '../../contexto/ContextoSesion.jsx';
import { SITIO } from '../../configuracion/sitio.js';

export default function FormularioIngreso() {
  const { ingresar } = usarSesion();

  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(null);
  const [entrando, setEntrando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setError(null);
    setEntrando(true);

    try {
      await ingresar(correo.trim(), clave);
    } catch (fallo) {
      setError(fallo.message);
      setClave('');
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="ingreso">
      <form className="ingreso-tarjeta" onSubmit={enviar}>
        <img src={SITIO.logo2} alt={SITIO.nombre} className="ingreso-logo" />
        <h1>Acceso al panel</h1>
        <p className="ingreso-ayuda">Introduce tus credenciales de administrador.</p>

        {error && (
          <div className="panel-aviso error" role="alert">
            <i className="fas fa-circle-exclamation" /> {error}
          </div>
        )}

        <div className="panel-campo">
          <label htmlFor="correo-ingreso">Correo electrónico</label>
          <input
            id="correo-ingreso" type="email" required autoComplete="username"
            value={correo} onChange={(evento) => setCorreo(evento.target.value)}
          />
        </div>

        <div className="panel-campo">
          <label htmlFor="clave-ingreso">Contraseña</label>
          <input
            id="clave-ingreso" type="password" required autoComplete="current-password"
            value={clave} onChange={(evento) => setClave(evento.target.value)}
          />
        </div>

        <button type="submit" className="boton-primario boton-bloque" disabled={entrando}>
          {entrando ? 'Entrando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
