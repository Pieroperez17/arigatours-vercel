/**
 * Portada a pantalla completa, como la apertura de una pelicula.
 *
 * Las fotos son las portadas que se administran desde el panel: se turnan
 * cada 7 segundos con un zoom muy lento (efecto Ken Burns) para que la
 * imagen respire aunque nadie toque nada. Abajo, el numero de la foto y una
 * barra que se llena hasta el cambio, que dice sin palabras que hay mas.
 *
 * El texto japones vertical de la derecha es adorno (日本を、あなたの言葉で:
 * "Japon, en tus palabras") y se oculta a los lectores de pantalla.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import TituloPorLineas from './TituloPorLineas.jsx';
import { IconoChat } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarPortadas } from '../ganchos/usarPortadas.js';
import { enlaceWhatsapp } from '../configuracion/sitio.js';
import { reportarClicWhatsapp } from '../servicios/seguimiento.js';

const SEGUNDOS_POR_FOTO = 7000;
const dosCifras = (numero) => String(numero).padStart(2, '0');

export default function PortadaCine() {
  const { t } = usarIdioma();
  const portadas = usarPortadas();

  const fotos = useMemo(() => portadas.slice(0, 6), [portadas]);
  const [actual, setActual] = useState(0);
  const indice = actual % Math.max(1, fotos.length);

  useEffect(() => {
    if (fotos.length < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const temporizador = setInterval(
      () => setActual((valor) => (valor + 1) % fotos.length),
      SEGUNDOS_POR_FOTO
    );

    return () => clearInterval(temporizador);
  }, [fotos.length]);

  return (
    <section className="cine">
      {fotos.map((foto, posicion) => (
        <div
          key={foto}
          className={`cine-foto${posicion === indice ? ' activa' : ''}`}
          style={{ backgroundImage: `url('${foto}')` }}
          aria-hidden="true"
        />
      ))}
      <div className="cine-velo" aria-hidden="true" />

      <p className="cine-vertical" aria-hidden="true">日本を、あなたの言葉で。</p>

      <div className="cine-texto">
        <div className="entradilla entradilla-clara">{t.portadaEntradilla}</div>
        <h1 className="cine-titulo"><TituloPorLineas texto={t.heroTitulo} /></h1>
        <p className="cine-entrada">{t.portadaTexto}</p>

        <div className="cine-botones">
          <a
            className="boton boton-solido"
            href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
            target="_blank"
            rel="noreferrer"
            onClick={reportarClicWhatsapp}
          >
            <IconoChat tamano={18} /> {t.reservarWhatsapp}
          </a>
          <Link className="boton boton-claro" to="/tours">{t.verTours}</Link>
        </div>
      </div>

      <div className="cine-pie" aria-hidden="true">
        {fotos.length > 1 && (
          <div className="cine-contador">
            <b>{dosCifras(indice + 1)}</b> / {dosCifras(fotos.length)}
            {/* La clave reinicia la animacion de la barra en cada foto */}
            <span className="cine-progreso"><span key={actual} /></span>
          </div>
        )}
        <div className="cine-desliza">{t.desliza}<i /></div>
      </div>
    </section>
  );
}
