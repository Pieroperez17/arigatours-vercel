/**
 * Pagina institucional, como un reportaje largo.
 *
 * Los ocho parrafos (que viven en el archivo de traducciones y no se tocan)
 * se leen en una sola columna estrecha, con capitular en el primero, una
 * foto a sangre a mitad del relato y los intertitulos del diseño entre
 * medias. Despues, una tira de fotos del equipo que se desliza de lado, y la
 * mision sobre fondo oscuro con 縁 (vinculo) en vertical.
 *
 * Se toman por posicion porque los tres idiomas comparten la misma
 * estructura de ocho parrafos, asi que cada uno cae en su sitio sea cual sea
 * el idioma.
 */

import { useRef } from 'react';

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import ConEnfasis from '../componentes/ConEnfasis.jsx';
import LlamadaFinal from '../componentes/LlamadaFinal.jsx';
import { IconoInstagram, IconoAnterior, IconoSiguiente } from '../componentes/Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { PARRAFOS_QUIENES_SOMOS } from '../traducciones/textos.js';
import { SITIO, recurso } from '../configuracion/sitio.js';

/*
 * "encuadre" corrige el recorte de la unica apaisada: en vertical, centrada,
 * el guia del selfie quedaba cortado por el borde derecho.
 */
const FOTOS = [
  { src: 'quienes-grupo-torii.webp', lugar: 'Fushimi Inari', ciudad: { es: 'Kioto', en: 'Kyoto', ja: '京都' },
    alt: 'Viajeros de ArigaTours bajo el gran torii de Fushimi Inari, Kioto' },
  { src: 'quienes-grupo-nara.webp', lugar: 'Todai-ji', ciudad: { es: 'Nara', en: 'Nara', ja: '奈良' },
    alt: 'Viajeros con su guia de ArigaTours frente al templo Todai-ji, Nara' },
  { src: 'quienes-grupo-sannomiya.webp', lugar: 'Sankita Street', ciudad: { es: 'Kobe', en: 'Kobe', ja: '神戸' },
    alt: 'Grupo de viajeros de ArigaTours en Sankita Street, Kobe' },
  { src: 'quienes-familia-kuromon.webp', lugar: 'Kuromon', encuadre: '70% center', ciudad: { es: 'Osaka', en: 'Osaka', ja: '大阪' },
    alt: 'Guia de ArigaTours con una familia en el mercado Kuromon, Osaka' },
  { src: 'quienes-guia-kobe.webp', lugar: 'Kitano', ciudad: { es: 'Kobe', en: 'Kobe', ja: '神戸' },
    alt: 'Guia de ArigaTours ante las casas occidentales del barrio de Kitano, en Kobe' },
  { src: 'quienes-viajeras-kobe.webp', lugar: '', ciudad: { es: 'Kobe', en: 'Kobe', ja: '神戸' },
    alt: 'Guia de ArigaTours con dos viajeras en una esquina de Kobe' },
  { src: 'quienes-pareja-estacion.webp', lugar: 'Hankyu Sannomiya', ciudad: { es: 'Kobe', en: 'Kobe', ja: '神戸' },
    alt: 'Pareja de viajeros de ArigaTours en la estacion Hankyu Kobe-sannomiya' },
];

export default function PaginaQuienesSomos() {
  const { idioma, t } = usarIdioma();
  const p = PARRAFOS_QUIENES_SOMOS[idioma] || PARRAFOS_QUIENES_SOMOS.es;
  const tira = useRef(null);

  const desplazarTira = (direccion) =>
    tira.current?.scrollBy({ left: direccion * tira.current.clientWidth * 0.7, behavior: 'smooth' });

  return (
    <>
      <CabeceraPagina
        entradilla={t.navQuienesSomos}
        titulo={t.quienesTitulo}
        subtitulo={t.quienesSubtitulo}
        kanji="縁"
      />

      <article className="relato">
        <p className="relato-capitular revelar">{p[0]}</p>
        <p className="revelar">{p[1]}</p>

        <figure className="relato-foto revelar-foto">
          <img src={recurso('quienes-grupo-osaka.webp')} alt="Grupo de viajeros de ArigaTours frente al castillo de Osaka" loading="lazy" />
          <figcaption>Osaka · 大阪城</figcaption>
        </figure>

        <h2 className="revelar"><ConEnfasis texto={t.quienesSplitTitulo} /></h2>
        <p className="revelar">{p[2]}</p>
        <p className="revelar">{p[3]}</p>

        <h2 className="revelar"><ConEnfasis texto={t.quienesComoTitulo} /></h2>
        <p className="revelar">{p[4]}</p>
        <p className="revelar">{p[5]}</p>
      </article>

      <section className="tira">
        <div className="cabeza-lado revelar">
          <div>
            <div className="entradilla">{t.quienesMomentosEntradilla}</div>
            <h2 className="titulo-seccion"><ConEnfasis texto={t.quienesMomentosTitulo} /></h2>
          </div>

          <div className="tira-controles">
            <button type="button" className="boton-circular" onClick={() => desplazarTira(-1)} aria-label={t.imagenAnterior}>
              <IconoAnterior tamano={20} />
            </button>
            <button type="button" className="boton-circular" onClick={() => desplazarTira(1)} aria-label={t.imagenSiguiente}>
              <IconoSiguiente tamano={20} />
            </button>
          </div>
        </div>

        <div className="tira-pista" ref={tira}>
          {FOTOS.map((foto, indice) => (
            <figure key={foto.src} className="revelar">
              <img src={recurso(foto.src)} alt={foto.alt} loading="lazy" draggable="false" style={foto.encuadre ? { objectPosition: foto.encuadre } : undefined} />
              <figcaption>
                <span>{String(indice + 1).padStart(2, '0')}</span>
                <b>{foto.ciudad[idioma] || foto.ciudad.es}</b> {foto.lugar}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="centrado">
          <a className="enlace-flecha" href={SITIO.redes.instagram} target="_blank" rel="noreferrer">
            <IconoInstagram tamano={18} /> {t.verInstagram}
          </a>
        </div>
      </section>

      <section className="mision">
        <span className="mision-vertical" aria-hidden="true">縁</span>
        <div className="mision-texto">
          <div className="entradilla entradilla-clara revelar">{t.quienesMisionEntradilla}</div>
          <p className="mision-frase revelar">{p[6]}</p>
          <p className="mision-cierre revelar">{p[7]}</p>
        </div>
      </section>

      <LlamadaFinal />
    </>
  );
}
