/**
 * Reseñas de viajeros en columnas, con filtro por fuente.
 *
 * Arriba, dos insignias que llevan a las fichas publicas: la nota de
 * Tripadvisor y GuruWalk, cuyas reseñas son de reservas verificadas. Son el
 * respaldo de lo que se cita abajo; sin el enlace, una nota de 5.0 escrita
 * en la propia web no convence a nadie.
 *
 * De entrada se ven seis. Al filtrar por una fuente se muestran todas las
 * de esa fuente: filtrar y seguir viendo solo seis seria esconder justo lo
 * que se ha pedido ver.
 */

import { useState } from 'react';

import ConEnfasis, { sinMarcas } from './ConEnfasis.jsx';
import { Estrellas } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { SITIO } from '../configuracion/sitio.js';

const VISIBLES_DE_ENTRADA = 6;

export default function SeccionResenas({ resenas }) {
  const { t } = usarIdioma();
  const [fuente, setFuente] = useState('todas');
  const [abiertas, setAbiertas] = useState(false);

  if (resenas.length === 0) return null;

  const filtros = [
    { clave: 'todas', etiqueta: t.resenasTodas, total: resenas.length },
    { clave: 'tripadvisor', etiqueta: 'Tripadvisor', total: resenas.filter((r) => r.fuente === 'tripadvisor').length },
    { clave: 'guruwalk', etiqueta: 'GuruWalk', total: resenas.filter((r) => r.fuente === 'guruwalk').length },
  ];

  const filtradas = fuente === 'todas' ? resenas : resenas.filter((r) => r.fuente === fuente);
  const visibles = fuente === 'todas' && !abiertas ? filtradas.slice(0, VISIBLES_DE_ENTRADA) : filtradas;
  const quedanOcultas = visibles.length < filtradas.length;

  return (
    <section className="seccion seccion-resenas">
      <div className="resenas-cabecera revelar">
        <div>
          <div className="entradilla">{t.resenasEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.resenasTitulo} /></h2>
        </div>

        <div className="resenas-insignias">
          <a className="insignia-resenas" href={SITIO.resenas.tripadvisor} target="_blank" rel="noreferrer">
            <b>{SITIO.resenas.notaTripadvisor.toFixed(1)} <Estrellas tamano={18} /></b>
            <small>{SITIO.resenas.totalTripadvisor} {t.resenasOpiniones}</small>
          </a>
          <a className="insignia-resenas" href={SITIO.resenas.guruwalk} target="_blank" rel="noreferrer">
            <b className="insignia-resenas-marca">GuruWalk</b>
            <small>{t.resenasVerificada}</small>
          </a>
        </div>
      </div>

      <div className="chips" role="group" aria-label={sinMarcas(t.resenasTitulo)}>
        {filtros.map((filtro) => (
          <button
            key={filtro.clave}
            type="button"
            aria-pressed={fuente === filtro.clave}
            onClick={() => setFuente(filtro.clave)}
          >
            {filtro.etiqueta} ({filtro.total})
          </button>
        ))}
      </div>

      <div className="resenas-columnas">
        {visibles.map((resena) => (
          <figure key={resena.id} className="resena revelar">
            <Estrellas />
            <blockquote>“{resena.texto}”</blockquote>
            <figcaption>
              <b>{resena.autor}</b>
              {resena.detalle && <span>{resena.detalle}</span>}
              <span className="resena-fuente">
                {resena.fuente === 'tripadvisor' ? 'Tripadvisor' : t.resenasFuenteGw}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="resenas-acciones">
        {quedanOcultas && (
          <button type="button" className="boton boton-linea" onClick={() => setAbiertas(true)}>
            {t.resenasVerMas}
          </button>
        )}
        <a className="boton boton-linea" href={SITIO.resenas.tripadvisor} target="_blank" rel="noreferrer">
          {t.resenasLeerTripadvisor}
        </a>
      </div>
    </section>
  );
}
