/**
 * Pagina de inicio: carrusel de portada + cuatro experiencias destacadas.
 */

import { Link } from 'react-router-dom';

import CarruselPortada from '../componentes/CarruselPortada.jsx';
import { Cargando, ErrorCarga } from '../componentes/Estado.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarTours } from '../ganchos/usarPeticion.js';

/** Temperaturas orientativas por region, como en la web original. */
const CLIMA_POR_REGION = {
  kanto: { primavera: '15-20°C', verano: '25-32°C', otonio: '18-23°C', invierno: '5-12°C' },
  kansai: { primavera: '16-22°C', verano: '27-34°C', otonio: '19-24°C', invierno: '6-13°C' },
};

const CIUDADES_KANTO = ['tokio', 'tokyo', 'kamakura', 'kanagawa', 'yokohama'];

/**
 * Quita las etiquetas HTML de la descripcion y devuelve un resumen corto
 * para la tarjeta. Se usa el propio navegador para interpretar el HTML.
 */
function resumirDescripcion(descripcionHtml, limite = 150) {
  const contenedor = document.createElement('div');
  contenedor.innerHTML = descripcionHtml || '';

  const textoPlano = (contenedor.textContent || '').trim();
  return textoPlano.length > limite ? `${textoPlano.slice(0, limite)}…` : textoPlano;
}

export default function PaginaInicio() {
  const { idioma, t } = usarIdioma();
  const { tours, cargando, error, recargar } = usarTours(idioma);

  const destacados = tours.slice(0, 4);

  return (
    <>
      <CarruselPortada />

      <section className="seccion-destacados">
        <div className="encabezado-seccion">
          <h2>{t.destacadosTitulo}</h2>
          <p>{t.destacadosSubtitulo}</p>
        </div>

        {cargando && <Cargando mensaje={t.cargandoTours} />}
        {error && <ErrorCarga mensaje={t.errorTours} alReintentar={recargar} />}

        {!cargando && !error && (
          <>
            <div className="rejilla-destacados">
              {destacados.map((tour) => {
                const clima = CIUDADES_KANTO.includes(tour.ciudadClave)
                  ? CLIMA_POR_REGION.kanto
                  : CLIMA_POR_REGION.kansai;

                return (
                  <article key={tour.id} className="tarjeta-destacada">
                    <div className="tarjeta-destacada-imagen">
                      <img src={tour.galeria?.[0] || tour.imagen} alt={tour.titulo} loading="lazy" />
                      <span className="etiqueta-ciudad">
                        <i className="fas fa-location-dot" /> {tour.ciudad}
                      </span>
                    </div>

                    <div className="tarjeta-destacada-cuerpo">
                      <div className="tarjeta-destacada-titulo">
                        <h3>{tour.titulo}</h3>
                        {tour.precio && <span>{tour.precio}</span>}
                      </div>

                      <p className="tarjeta-destacada-resumen">{resumirDescripcion(tour.descripcion)}</p>

                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{t.climaRegion}</strong>
                        <div className="rejilla-clima">
                          <div><span style={{ color: '#e91e63' }}>🌸 {t.primavera}:</span> {clima.primavera}</div>
                          <div><span style={{ color: '#ff9800' }}>☀️ {t.verano}:</span> {clima.verano}</div>
                          <div><span style={{ color: '#795548' }}>🍁 {t.otonio}:</span> {clima.otonio}</div>
                          <div><span style={{ color: '#03a9f4' }}>❄️ {t.invierno}:</span> {clima.invierno}</div>
                        </div>
                      </div>

                      <div className="tarjeta-destacada-pie">
                        <Link to={`/tours?tour=${tour.id}`} className="boton-primario">
                          {t.verItinerario} <i className="fas fa-arrow-right" style={{ marginLeft: 6 }} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/tours" className="boton-primario">{t.destacadosBoton}</Link>
            </div>
          </>
        )}
      </section>
    </>
  );
}
