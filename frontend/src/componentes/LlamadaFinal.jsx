/**
 * Cierre de pagina: la invitacion a escribir, sobre fondo rosa con el 旅
 * (viaje) gigante en blanco detras. Se repite al final de las paginas que
 * no terminan ya en un formulario.
 */

import { Link } from 'react-router-dom';

import ConEnfasis from './ConEnfasis.jsx';
import { IconoChat } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { enlaceWhatsapp } from '../configuracion/sitio.js';

export default function LlamadaFinal() {
  const { t } = usarIdioma();

  return (
    <section className="llamada-final">
      <span className="llamada-final-kanji" aria-hidden="true">旅</span>

      <div className="entradilla revelar">{t.finalEntradilla}</div>
      <h2 className="revelar"><ConEnfasis texto={t.finalTitulo} /></h2>
      <p className="entrada revelar">{t.finalTexto}</p>

      <div className="llamada-final-botones revelar">
        <a
          className="boton boton-solido"
          href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
          target="_blank"
          rel="noreferrer"
        >
          <IconoChat tamano={18} /> {t.reservarWhatsapp}
        </a>
        <Link className="boton boton-linea" to="/contacto">{t.escribirCorreo}</Link>
      </div>
    </section>
  );
}
