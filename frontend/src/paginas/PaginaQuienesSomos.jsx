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

// Cada foto se inserta despues del parrafo con este indice.
const FOTO_PANORAMICA = {
  tras: 1,
  src: '/recursos/quienes-grupo-osaka.webp',
  alt: 'Grupo de viajeros de ArigaTours frente al castillo de Osaka',
};

const FOTOS_PAREJA = {
  tras: 4,
  imagenes: [
    {
      src: '/recursos/quienes-grupo-torii.webp',
      alt: 'Viajeros de ArigaTours bajo el torii rojo de un santuario japones',
    },
    {
      src: '/recursos/quienes-guia-kobe.webp',
      alt: 'Guia de ArigaTours ante las casas occidentales del barrio de Kitano, en Kobe',
    },
  ],
};

export default function PaginaQuienesSomos() {
  const { idioma, t } = usarIdioma();
  const parrafos = PARRAFOS_QUIENES_SOMOS[idioma] || PARRAFOS_QUIENES_SOMOS.es;

  return (
    <>
      <CabeceraPagina titulo={t.quienesTitulo} subtitulo={t.quienesSubtitulo} />

      <div className="pagina">
        <div className="texto-largo">
          {parrafos.map((parrafo, indice) => (
            <div key={parrafo.slice(0, 40)}>
              <p>{parrafo}</p>

              {indice === FOTO_PANORAMICA.tras && (
                <figure className="foto-relato">
                  <img
                    src={FOTO_PANORAMICA.src}
                    alt={FOTO_PANORAMICA.alt}
                    loading="lazy"
                  />
                </figure>
              )}

              {indice === FOTOS_PAREJA.tras && (
                <div className="foto-relato-pareja">
                  {FOTOS_PAREJA.imagenes.map((foto) => (
                    <figure key={foto.src} className="foto-relato">
                      <img src={foto.src} alt={foto.alt} loading="lazy" />
                    </figure>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
