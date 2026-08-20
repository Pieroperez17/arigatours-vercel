/**
 * Pagina institucional. Los parrafos viven en el archivo de traducciones
 * para poder editarlos en los tres idiomas desde un solo sitio.
 *
 * Las fotos van intercaladas entre los parrafos, no todas juntas al final:
 * ocho bloques de texto seguidos cansan, y cada foto marca una pausa. Se
 * colocan por posicion (indice del parrafo) porque los tres idiomas
 * comparten la misma estructura de ocho parrafos, asi que la foto cae en
 * el mismo punto del relato sea cual sea el idioma.
 */

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { PARRAFOS_QUIENES_SOMOS } from '../traducciones/textos.js';

/*
 * La clave es el indice del parrafo tras el que aparece el bloque, y el
 * valor las fotos que lo componen. Un bloque de una sola foto se muestra
 * a lo ancho y conserva su proporcion original; los de varias se reparten
 * la fila en columnas iguales, asi que ahi conviene agrupar solo fotos
 * verticales para que no queden unas mucho mas altas que otras.
 */
const BLOQUES_DE_FOTOS = {
  1: [
    {
      src: '/recursos/quienes-grupo-osaka.webp',
      alt: 'Grupo de viajeros de ArigaTours frente al castillo de Osaka',
    },
  ],
  3: [
    {
      src: '/recursos/quienes-grupo-torii.webp',
      alt: 'Viajeros de ArigaTours bajo el torii rojo de un santuario japones',
    },
    {
      src: '/recursos/quienes-guia-kobe.webp',
      alt: 'Guia de ArigaTours ante las casas occidentales del barrio de Kitano, en Kobe',
    },
    {
      src: '/recursos/quienes-grupo-sannomiya.webp',
      alt: 'Grupo de viajeros de ArigaTours en una calle comercial de Sannomiya, Kobe',
    },
  ],
  5: [
    {
      src: '/recursos/quienes-viajeras-kobe.webp',
      alt: 'Guia de ArigaTours con dos viajeras en una esquina de Kobe',
    },
    {
      src: '/recursos/quienes-pareja-estacion.webp',
      alt: 'Pareja de viajeros de ArigaTours en la estacion Hankyu Kobe-sannomiya',
    },
  ],
  6: [
    {
      src: '/recursos/quienes-familia-kuromon.webp',
      alt: 'Guia de ArigaTours con una familia en el mercado Kuromon de Osaka',
    },
  ],
};

function BloqueDeFotos({ fotos }) {
  const figuras = fotos.map((foto) => (
    <figure key={foto.src} className="foto-relato">
      <img src={foto.src} alt={foto.alt} loading="lazy" />
    </figure>
  ));

  // Una sola foto no necesita rejilla: ocupa el ancho del texto por si sola.
  if (figuras.length === 1) return figuras[0];

  return <div className="foto-relato-grupo">{figuras}</div>;
}

export default function PaginaQuienesSomos() {
  const { idioma, t } = usarIdioma();
  const parrafos = PARRAFOS_QUIENES_SOMOS[idioma] || PARRAFOS_QUIENES_SOMOS.es;

  return (
    <>
      <CabeceraPagina titulo={t.quienesTitulo} subtitulo={t.quienesSubtitulo} />

      <div className="pagina">
        <div className="texto-largo">
          {parrafos.map((parrafo, indice) => {
            const fotos = BLOQUES_DE_FOTOS[indice];

            return (
              <div key={parrafo.slice(0, 40)}>
                <p>{parrafo}</p>
                {fotos && <BloqueDeFotos fotos={fotos} />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
