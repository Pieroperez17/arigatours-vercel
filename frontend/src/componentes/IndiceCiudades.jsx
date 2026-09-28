/**
 * Indice de ciudades: una lista tipografica grande, una ciudad por fila.
 *
 * Cada fila lleva a su lado una miniatura redonda de la ciudad, igual en
 * escritorio que en movil. Antes, en escritorio, la foto flotaba y seguia al
 * cursor; se quito para que la lista se lea igual en cualquier pantalla.
 */

import { Link } from 'react-router-dom';

import ConEnfasis from './ConEnfasis.jsx';
import { IconoFlecha } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { KANJI_CIUDAD } from '../configuracion/sitio.js';

export default function IndiceCiudades({ ciudades }) {
  const { t } = usarIdioma();

  if (ciudades.length === 0) return null;

  return (
    <section className="seccion indice">
      <div className="cabeza-lado revelar">
        <div>
          <div className="entradilla">{t.indiceEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.indiceTitulo} /></h2>
        </div>
        <Link to="/tours" className="enlace-flecha">{t.verTodos} <IconoFlecha tamano={18} /></Link>
      </div>

      <ol className="indice-lista">
        {ciudades.map((ciudad, indice) => (
          <li key={ciudad.clave} className="revelar">
            <Link to={`/tours?ciudad=${ciudad.clave}`}>
              <span className="indice-num">{String(indice + 1).padStart(2, '0')}</span>
              <img className="indice-miniatura" src={ciudad.imagen} alt="" loading="lazy" />
              <span className="indice-nombre">{ciudad.nombre}</span>
              {KANJI_CIUDAD[ciudad.clave] && (
                <span className="indice-kanji" aria-hidden="true">{KANJI_CIUDAD[ciudad.clave]}</span>
              )}
              <span className="indice-total">
                {ciudad.total} {ciudad.total === 1 ? t.ciudadesTour : t.ciudadesTours}
              </span>
              <IconoFlecha tamano={22} />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
