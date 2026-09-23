/**
 * Portada del inicio: el texto a la izquierda y, a la derecha, un arco con
 * fotos de viajeros reales que se van turnando, con el sol rojo detras.
 *
 * Las fotos son del equipo en cada ciudad y llevan su nombre debajo: es la
 * prueba de que el tour existe y de como se vive, que ninguna foto de
 * paisaje da. Por eso salen de FOTOS_ARCO y no de las portadas del panel.
 *
 * Los petalos que caen son 14 elementos vacios animados solo con CSS.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import ConEnfasis from './ConEnfasis.jsx';
import { IconoChat, IconoCheck, IconoEstrella } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { SITIO, FOTOS_ARCO, recurso, enlaceWhatsapp } from '../configuracion/sitio.js';

const SEGUNDOS_ENTRE_FOTOS = 5000;
const PETALOS = 14;

export default function PortadaArco() {
  const { idioma, t } = usarIdioma();
  const [actual, setActual] = useState(0);
  const [vueltas, setVueltas] = useState(0);

  /*
   * Al pulsar un punto se reinicia la cuenta: sin esto, a veces la foto
   * cambiaba sola medio segundo despues del clic y parecia que el punto no
   * habia respondido.
   */
  const irA = useCallback((indice) => {
    setActual(indice);
    setVueltas((valor) => valor + 1);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const temporizador = setInterval(
      () => setActual((indice) => (indice + 1) % FOTOS_ARCO.length),
      SEGUNDOS_ENTRE_FOTOS
    );

    return () => clearInterval(temporizador);
  }, [vueltas]);

  const foto = FOTOS_ARCO[actual];

  return (
    <section className="portada">
      <div className="petalos" aria-hidden="true">
        {Array.from({ length: PETALOS }, (_, indice) => <i key={indice} />)}
      </div>

      <div className="portada-texto">
        <div className="entradilla">{t.portadaEntradilla}</div>
        <h1><ConEnfasis texto={t.heroTitulo} /></h1>
        <p className="entrada">{t.portadaTexto}</p>

        <div className="portada-botones">
          <a
            className="boton boton-solido"
            href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
            target="_blank"
            rel="noreferrer"
          >
            <IconoChat tamano={18} /> {t.reservarWhatsapp}
          </a>
          <Link className="boton boton-linea" to="/tours">{t.verTours}</Link>
        </div>

        <ul className="confianza">
          <li>
            <IconoEstrella tamano={16} />
            <a href={SITIO.resenas.tripadvisor} target="_blank" rel="noreferrer">
              {t.confianzaResenas} · {SITIO.resenas.totalTripadvisor}
            </a>
          </li>
          <li><IconoCheck tamano={16} /> {t.confianzaGuias}</li>
          <li><IconoCheck tamano={16} /> {t.confianzaRitmo}</li>
        </ul>
      </div>

      <div className="portada-visual">
        <span className="sol" aria-hidden="true" />

        <div className="arco">
          {FOTOS_ARCO.map((elemento, indice) => (
            <img
              key={elemento.foto}
              src={recurso(elemento.foto)}
              alt={indice === actual ? elemento.alt : ''}
              className={indice === actual ? 'activa' : undefined}
              fetchpriority={indice === 0 ? 'high' : undefined}
              loading={indice === 0 ? 'eager' : 'lazy'}
            />
          ))}

          {/* La clave fuerza a React a recrear el texto y repetir su entrada */}
          <span className="arco-ciudad" key={`c-${actual}`}>{foto.ciudad[idioma] || foto.ciudad.es}</span>
          <span className="arco-lugar" key={`l-${actual}`}>{foto.lugar}</span>
        </div>

        <div className="puntos">
          {FOTOS_ARCO.map((elemento, indice) => (
            <button
              key={elemento.foto}
              type="button"
              onClick={() => irA(indice)}
              aria-label={elemento.ciudad[idioma] || elemento.ciudad.es}
              aria-pressed={indice === actual}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
