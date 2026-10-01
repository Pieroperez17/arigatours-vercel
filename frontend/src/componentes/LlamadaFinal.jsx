/**
 * Cierre de pagina: una foto real de un grupo con su guia, a todo lo ancho,
 * y encima la invitacion a escribir. La foto hace el trabajo que ningun
 * texto hace: ensena como acaba el mensaje que se pide mandar.
 */

import { Link } from 'react-router-dom';

import ConEnfasis from './ConEnfasis.jsx';
import { IconoChat } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { enlaceWhatsapp, recurso } from '../configuracion/sitio.js';
import { reportarClicWhatsapp } from '../servicios/seguimiento.js';

export default function LlamadaFinal() {
  const { t } = usarIdioma();

  return (
    <section className="llamada-final">
      <img
        className="llamada-final-foto"
        src={recurso('quienes-grupo-osaka.webp')}
        alt=""
        loading="lazy"
      />

      <div className="llamada-final-contenido">
        <div className="entradilla entradilla-clara revelar">{t.finalEntradilla}</div>
        <h2 className="revelar"><ConEnfasis texto={t.finalTitulo} /></h2>
        <p className="revelar">{t.finalTexto}</p>

        <div className="llamada-final-botones revelar">
          <a
            className="boton boton-solido"
            href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
            target="_blank"
            rel="noreferrer"
            onClick={reportarClicWhatsapp}
          >
            <IconoChat tamano={18} /> {t.reservarWhatsapp}
          </a>
          <Link className="boton boton-claro" to="/contacto">{t.escribirCorreo}</Link>
        </div>
      </div>
    </section>
  );
}
