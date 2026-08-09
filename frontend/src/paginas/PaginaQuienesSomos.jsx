/**
 * Pagina institucional. Los parrafos viven en el archivo de traducciones
 * para poder editarlos en los tres idiomas desde un solo sitio.
 */

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { PARRAFOS_QUIENES_SOMOS } from '../traducciones/textos.js';

export default function PaginaQuienesSomos() {
  const { idioma, t } = usarIdioma();
  const parrafos = PARRAFOS_QUIENES_SOMOS[idioma] || PARRAFOS_QUIENES_SOMOS.es;

  return (
    <>
      <CabeceraPagina titulo={t.quienesTitulo} subtitulo={t.quienesSubtitulo} />

      <div className="pagina">
        <div className="texto-largo">
          {parrafos.map((parrafo) => (
            <p key={parrafo.slice(0, 40)}>{parrafo}</p>
          ))}
        </div>
      </div>
    </>
  );
}
