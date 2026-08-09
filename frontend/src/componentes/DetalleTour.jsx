/**
 * Ficha completa de un tour: galeria con carrusel, pestanias de contenido y
 * boton de consulta por WhatsApp con el mensaje ya escrito.
 *
 * Nota sobre la descripcion: los textos guardados en la base traen etiquetas
 * HTML simples (<br>, <strong>) heredadas del contenido original, por eso se
 * pintan con dangerouslySetInnerHTML. El contenido lo escribe la propia
 * agencia desde el panel, no visitantes anonimos.
 */

import { useState, useEffect } from 'react';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { SITIO } from '../configuracion/sitio.js';
import VisorImagenes from './VisorImagenes.jsx';

export default function DetalleTour({ tour, fechaConsulta }) {
  const { t } = usarIdioma();

  const [pestania, setPestania] = useState('descripcion');
  const [indiceGaleria, setIndiceGaleria] = useState(0);
  const [visorAbierto, setVisorAbierto] = useState(false);

  const imagenes = tour.galeria?.length > 0 ? tour.galeria : [tour.imagen].filter(Boolean);

  // Al cambiar de tour se vuelve a la primera pestania y a la primera foto.
  // De colocar la vista en su sitio se encarga <PanelDividido>, que es quien
  // sabe si el detalle esta al lado del listado o debajo.
  useEffect(() => {
    setPestania('descripcion');
    setIndiceGaleria(0);
  }, [tour.id]);

  function abrirWhatsapp() {
    let mensaje = `${t.mensajeWhatsappInicio} "${tour.titulo}"`;

    if (fechaConsulta) {
      const [anio, mes, dia] = fechaConsulta.split('-');
      mensaje += ` ${t.mensajeWhatsappFecha} ${dia}/${mes}/${anio}`;
    }

    window.open(
      `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(`${mensaje}.`)}`,
      '_blank',
      'noopener'
    );
  }

  const pestanias = [
    { clave: 'descripcion', etiqueta: t.pestaniaDescripcion },
    { clave: 'detalles', etiqueta: t.pestaniaDetalles },
    { clave: 'punto', etiqueta: t.pestaniaPunto },
  ];

  return (
    <article className="detalle-tour">
      <header className="detalle-encabezado">
        <h2>{tour.titulo}</h2>

        <div className="detalle-acciones">
          {tour.precio && <span className="detalle-precio">{tour.precio}</span>}

          <button type="button" className="boton-whatsapp" onClick={abrirWhatsapp}>
            <i className="fab fa-whatsapp" style={{ fontSize: '1.3rem' }} /> {t.consultar}
          </button>
        </div>
      </header>

      {imagenes.length > 0 && (
        <div className="galeria">
          <div
            className="galeria-pista"
            style={{ transform: `translateX(-${indiceGaleria * 100}%)` }}
          >
            {imagenes.map((imagen, posicion) => (
              <img
                key={imagen}
                src={imagen}
                alt={`${tour.titulo} ${posicion + 1}`}
                loading={posicion === 0 ? 'eager' : 'lazy'}
                onClick={() => { setIndiceGaleria(posicion); setVisorAbierto(true); }}
              />
            ))}
          </div>

          {imagenes.length > 1 && (
            <>
              <button
                type="button"
                className="galeria-flecha anterior"
                onClick={() => setIndiceGaleria((actual) => (actual - 1 + imagenes.length) % imagenes.length)}
                aria-label={t.imagenAnterior}
              >
                ❮
              </button>

              <button
                type="button"
                className="galeria-flecha siguiente"
                onClick={() => setIndiceGaleria((actual) => (actual + 1) % imagenes.length)}
                aria-label={t.imagenSiguiente}
              >
                ❯
              </button>

              <span className="galeria-contador">{indiceGaleria + 1} / {imagenes.length}</span>
            </>
          )}
        </div>
      )}

      <ul className="pestanias" role="tablist">
        {pestanias.map((elemento) => (
          <li key={elemento.clave} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={pestania === elemento.clave}
              className={`pestania${pestania === elemento.clave ? ' activa' : ''}`}
              onClick={() => setPestania(elemento.clave)}
            >
              {elemento.etiqueta}
            </button>
          </li>
        ))}
      </ul>

      {pestania === 'descripcion' && (
        <div className="panel-pestania" role="tabpanel">
          <div
            className="texto-descripcion"
            dangerouslySetInnerHTML={{ __html: tour.descripcion }}
          />
        </div>
      )}

      {pestania === 'detalles' && (
        <div className="panel-pestania" role="tabpanel">
          <ul className="lista-detalles">
            {tour.duracion && (
              <li>
                <i className="fas fa-hourglass-half" />
                <div>
                  <strong>{t.duracion}</strong>
                  <span>{tour.duracion}</span>
                </div>
              </li>
            )}

            <li>
              <i className="fas fa-comment" />
              <div>
                <strong>{t.idiomaGuia}</strong>
                <span>{t.idiomaGuiaTexto}</span>
              </div>
            </li>

            <li>
              <i className="fas fa-circle-check" style={{ color: '#28a745' }} />
              <div>
                <strong>{t.incluido}</strong>
                <ul>
                  {tour.incluye?.length > 0
                    ? tour.incluye.map((elemento) => <li key={elemento}>{elemento}</li>)
                    : <li>{t.sinDetalles}</li>}
                </ul>
              </div>
            </li>

            <li>
              <i className="fas fa-circle-xmark" style={{ color: '#e60000' }} />
              <div>
                <strong>{t.noIncluido}</strong>
                <ul>
                  {tour.noIncluye?.length > 0
                    ? tour.noIncluye.map((elemento) => <li key={elemento}>{elemento}</li>)
                    : <li>{t.sinEspecificar}</li>}
                </ul>
              </div>
            </li>
          </ul>
        </div>
      )}

      {pestania === 'punto' && (
        <div className="panel-pestania" role="tabpanel">
          <div className="caja-punto-encuentro">
            <i className="fas fa-map-location-dot" />
            <div>
              <h3>{t.pestaniaPunto}</h3>
              <p>{tour.puntoEncuentro || t.puntoPorCoordinar}</p>
            </div>
          </div>
        </div>
      )}

      {visorAbierto && (
        <VisorImagenes
          imagenes={imagenes}
          indice={indiceGaleria}
          alCambiar={setIndiceGaleria}
          alCerrar={() => setVisorAbierto(false)}
        />
      )}
    </article>
  );
}
