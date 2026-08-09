/**
 * Pagina de contacto de un socio — /contacto/:socio
 *
 * Es a donde llega quien escanea el QR de una tarjeta. Cada socio tiene la
 * suya, con sus propios datos, y todo lo que hay aqui son maneras de
 * escribirle: un solo toque desde el movil, sin formularios de por medio.
 */

import { useParams, Link } from 'react-router-dom';

import { apiSocios } from '../servicios/clienteApi.js';
import { usarPeticion } from '../ganchos/usarPeticion.js';
import { Cargando } from '../componentes/Estado.jsx';
import { SITIO } from '../configuracion/sitio.js';

/**
 * wa.me solo acepta digitos: los espacios, guiones y el signo mas que se
 * escriben en el panel para que el numero se lea comodo romperian el enlace.
 */
export function enlaceWhatsapp(numero, mensaje) {
  const digitos = String(numero || '').replace(/\D/g, '');
  if (!digitos) return '';

  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
  return `https://wa.me/${digitos}${texto}`;
}

export function enlaceInstagram(usuario) {
  const limpio = String(usuario || '').replace(/^@/, '').trim();
  return limpio ? `https://instagram.com/${limpio}` : '';
}

export default function PaginaContactoSocio() {
  const { socio: idSocio } = useParams();

  const { datos: socio, cargando, error } = usarPeticion(
    () => apiSocios.obtener(idSocio),
    [idSocio]
  );

  if (cargando) return <Cargando mensaje="Cargando…" />;

  /*
   * Cualquier fallo se muestra igual: "no existe". Quien llega aqui viene de
   * escanear un QR, no sabe que es una API ni le sirve el mensaje tecnico;
   * lo util es ofrecerle la web para que no se quede en un callejon sin
   * salida.
   */
  if (error || !socio) {
    return (
      <section className="socio-vacio">
        <h1>Esta página de contacto no existe</h1>
        <p>Puede que el enlace esté mal escrito o que la tarjeta ya no esté en uso.</p>
        <Link to="/" className="boton-primario">Ir a {SITIO.nombre}</Link>
      </section>
    );
  }

  const whatsapp = enlaceWhatsapp(socio.whatsapp, socio.mensajeWhatsapp);
  const instagram = enlaceInstagram(socio.instagram);

  return (
    <section className="socio">
      <article className="socio-tarjeta">
        {socio.foto ? (
          <img className="socio-foto" src={socio.foto} alt={socio.nombre} />
        ) : (
          /*
           * Sin foto se muestra la inicial en un circulo. Es preferible a un
           * hueco o a un icono generico: la tarjeta sigue viendose acabada
           * aunque el socio todavia no haya subido su retrato.
           */
          <div className="socio-foto socio-foto-inicial" aria-hidden="true">
            {socio.nombre.trim().charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="socio-nombre">{socio.nombre}</h1>
        {socio.cargo && <p className="socio-cargo">{socio.cargo}</p>}

        <div className="socio-botones">
          {whatsapp && (
            <a className="socio-boton whatsapp" href={whatsapp} target="_blank" rel="noreferrer">
              <i className="fab fa-whatsapp" /> Escribirme por WhatsApp
            </a>
          )}

          {instagram && (
            <a className="socio-boton instagram" href={instagram} target="_blank" rel="noreferrer">
              <i className="fab fa-instagram" /> Enviar mensaje por Instagram
            </a>
          )}

          {socio.correo && (
            <a className="socio-boton correo" href={`mailto:${socio.correo}`}>
              <i className="fas fa-envelope" /> Enviar un correo
            </a>
          )}

          <Link className="socio-boton web" to="/">
            <i className="fas fa-globe" /> Visitar {SITIO.nombre}
          </Link>
        </div>

        <p className="socio-pie">Gracias por confiar en nosotros ❤</p>
      </article>
    </section>
  );
}
