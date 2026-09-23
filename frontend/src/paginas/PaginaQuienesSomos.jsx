/**
 * Pagina institucional. Los parrafos viven en el archivo de traducciones
 * para poder editarlos en los tres idiomas desde un solo sitio.
 *
 * Los ocho parrafos se reparten en bloques con distinto tono en vez de ir
 * seguidos: el primero, que es la idea de la agencia, en grande y cursiva;
 * los que cuentan quienes son, junto a una foto; la mision, sobre rojo. Se
 * toman por posicion porque los tres idiomas comparten la misma estructura
 * de ocho parrafos, asi que cada uno cae en su bloque sea cual sea el
 * idioma. El texto de los parrafos no se toca: solo cambia donde va.
 */

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import ConEnfasis from '../componentes/ConEnfasis.jsx';
import LlamadaFinal from '../componentes/LlamadaFinal.jsx';
import { IconoInstagram } from '../componentes/Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { PARRAFOS_QUIENES_SOMOS } from '../traducciones/textos.js';
import { SITIO, recurso } from '../configuracion/sitio.js';

const FOTO_PRINCIPAL = {
  src: 'quienes-grupo-osaka.webp',
  alt: 'Grupo de viajeros de ArigaTours frente al castillo de Osaka',
};

/*
 * Galeria de "momentos reales", en columnas tipo masonry: cada foto conserva
 * su forma. Con una rejilla de filas fijas, la unica apaisada (Kuromon)
 * obligaba a recortar caras o a dejar un hueco al final.
 */
const GALERIA = [
  { src: 'quienes-grupo-torii.webp', ciudad: { es: 'Kioto', en: 'Kyoto', ja: '京都' },
    alt: 'Viajeros de ArigaTours bajo el gran torii de Fushimi Inari, Kioto' },
  { src: 'quienes-grupo-sannomiya.webp', ciudad: { es: 'Kobe', en: 'Kobe', ja: '神戸' },
    alt: 'Grupo de viajeros de ArigaTours en Sankita Street, Kobe' },
  { src: 'quienes-grupo-nara.webp', ciudad: { es: 'Nara', en: 'Nara', ja: '奈良' },
    alt: 'Viajeros con su guia de ArigaTours frente al templo Todai-ji, Nara' },
  { src: 'quienes-familia-kuromon.webp', ciudad: { es: 'Osaka', en: 'Osaka', ja: '大阪' },
    alt: 'Guia de ArigaTours con una familia en el mercado Kuromon, Osaka' },
  { src: 'quienes-viajeras-kobe.webp', ciudad: { es: 'Kobe', en: 'Kobe', ja: '神戸' },
    alt: 'Guia de ArigaTours con dos viajeras en una esquina de Kobe' },
  { src: 'quienes-guia-kobe.webp', ciudad: { es: 'Kitano', en: 'Kitano', ja: '北野' },
    alt: 'Guia de ArigaTours ante las casas occidentales del barrio de Kitano, en Kobe' },
  { src: 'quienes-pareja-estacion.webp', ciudad: { es: 'Sannomiya', en: 'Sannomiya', ja: '三宮' },
    alt: 'Pareja de viajeros de ArigaTours en la estacion Hankyu Kobe-sannomiya' },
];

export default function PaginaQuienesSomos() {
  const { idioma, t } = usarIdioma();
  const p = PARRAFOS_QUIENES_SOMOS[idioma] || PARRAFOS_QUIENES_SOMOS.es;

  return (
    <>
      <CabeceraPagina
        entradilla={t.navQuienesSomos}
        titulo={t.quienesTitulo}
        subtitulo={t.quienesSubtitulo}
        kanji="縁"
      />

      <section className="seccion">
        <div className="intro-nosotros">
          <p className="cita-grande revelar">{p[0]}</p>
          <span className="linea-vertical" aria-hidden="true" />
          <p className="entrada revelar">{p[1]}</p>
        </div>
      </section>

      <section className="seccion seccion-sin-arriba">
        <div className="dividido">
          <figure className="dividido-foto revelar">
            <img src={recurso(FOTO_PRINCIPAL.src)} alt={FOTO_PRINCIPAL.alt} loading="lazy" />
          </figure>

          <div className="dividido-texto">
            <div className="entradilla entradilla-sola revelar">{t.navQuienesSomos}</div>
            <h2 className="revelar"><ConEnfasis texto={t.quienesSplitTitulo} /></h2>
            <p className="entrada revelar">{p[2]}</p>
            <p className="entrada revelar">{p[3]}</p>
          </div>
        </div>
      </section>

      <section className="seccion seccion-sin-arriba">
        <div className="cabeza-centrada cabeza-estrecha">
          <div className="entradilla entradilla-sola revelar">{t.quienesComoEntradilla}</div>
          <h2 className="titulo-seccion revelar"><ConEnfasis texto={t.quienesComoTitulo} /></h2>
          <p className="entrada revelar">{p[4]}</p>
          <p className="entrada revelar">{p[5]}</p>
        </div>
      </section>

      <section className="seccion seccion-sin-arriba">
        <div className="cabeza-centrada revelar">
          <div className="entradilla entradilla-sola">{t.quienesMomentosEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.quienesMomentosTitulo} /></h2>
        </div>

        <div className="mosaico">
          {GALERIA.map((foto) => (
            <figure key={foto.src} className="revelar">
              <img src={recurso(foto.src)} alt={foto.alt} loading="lazy" />
              <figcaption>{foto.ciudad[idioma] || foto.ciudad.es}</figcaption>
            </figure>
          ))}
        </div>

        <div className="centrado">
          <a className="boton boton-linea" href={SITIO.redes.instagram} target="_blank" rel="noreferrer">
            <IconoInstagram tamano={18} /> {t.verInstagram}
          </a>
        </div>
      </section>

      <section className="mision">
        <div className="entradilla entradilla-clara revelar">{t.quienesMisionEntradilla}</div>
        <p className="mision-texto revelar">{p[6]}</p>
        <p className="mision-cierre revelar">{p[7]}</p>
      </section>

      <LlamadaFinal />
    </>
  );
}
