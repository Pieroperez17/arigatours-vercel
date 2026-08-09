/**
 * Envoltura para rutas que exigen sesion iniciada.
 *
 * Mientras se comprueba el token guardado muestra un indicador; si no hay
 * sesion valida deja pasar igual, porque la propia pagina del panel dibuja
 * el formulario de ingreso. Asi el administrador entra y sale sin cambiar
 * de direccion.
 */

import { usarSesion } from '../contexto/ContextoSesion.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { Cargando } from './Estado.jsx';

export default function RutaProtegida({ children }) {
  const { comprobando } = usarSesion();
  const { t } = usarIdioma();

  if (comprobando) {
    return (
      <div className="pagina-centrada">
        <Cargando mensaje={t.cargando} />
      </div>
    );
  }

  return children;
}
