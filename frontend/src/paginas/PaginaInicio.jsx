/**
 * Pagina de inicio: carrusel de portada + cuatro experiencias destacadas.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import CarruselPortada from '../componentes/CarruselPortada.jsx';
import CarruselHorizontal from '../componentes/CarruselHorizontal.jsx';
import CarruselResenas from '../componentes/CarruselResenas.jsx';
import { Cargando, ErrorCarga } from '../componentes/Estado.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarTours, usarBlogs } from '../ganchos/usarPeticion.js';
import { RESENAS } from '../datos/resenas.js';

/*
 * Aqui vivian la tabla de temperaturas por region y el resumen recortado de
 * la descripcion. Se fueron con las tarjetas grandes: ocupaban mas de media
 * tarjeta cada una y repetian, peor, lo que ya cuenta la ficha del tour.
 */

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
              {destacados.map((tour) => (
                <Link
                  key={tour.id}
                  to={`/tours?tour=${tour.id}`}
                  className="tarjeta-destacada"
                >
                  <div className="tarjeta-destacada-imagen">
                    <img src={tour.galeria?.[0] || tour.imagen} alt="" loading="lazy" />
                    <span className="etiqueta-ciudad">{tour.ciudad}</span>
                  </div>

                  <div className="tarjeta-destacada-cuerpo">
                    <h3>{tour.titulo}</h3>

                    {/*
                      Duracion y precio en una sola linea. Es lo que de verdad
                      se compara de un vistazo entre tarjetas; la descripcion
                      y el clima estan en la ficha del tour, que es donde se
                      leen con calma.
                    */}
                    <div className="tarjeta-destacada-datos">
                      {tour.duracion && <span>{tour.duracion}</span>}
                      {tour.precio && <span className="tarjeta-destacada-precio">{tour.precio}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/tours" className="boton-primario">{t.destacadosBoton}</Link>
            </div>
          </>
        )}
      </section>

      <SeccionCiudades tours={tours} />
      <SeccionResenas />
      <SeccionDiario />
    </>
  );
}

/**
 * Ciudades donde hay tours, en carrusel.
 *
 * La lista sale de los propios tours y no de una lista escrita a mano: asi,
 * el dia que se anada un tour de una ciudad nueva, aparece sola. De cada
 * ciudad se toma la foto de su primer tour, que es el que el panel deja
 * arriba del todo por el campo "orden".
 */
function SeccionCiudades({ tours }) {
  const { t } = usarIdioma();

  const ciudades = useMemo(() => {
    const porClave = new Map();

    for (const tour of tours) {
      if (!tour.ciudad) continue;
      const clave = tour.ciudadClave || tour.ciudad;

      if (!porClave.has(clave)) {
        porClave.set(clave, { clave, nombre: tour.ciudad, imagen: tour.imagen, total: 0 });
      }
      porClave.get(clave).total += 1;
    }

    return [...porClave.values()];
  }, [tours]);

  if (ciudades.length === 0) return null;

  return (
    <CarruselHorizontal
      entradilla={t.ciudadesEntradilla}
      titulo={t.ciudadesTitulo}
      extra={<Link to="/tours" className="carrusel-enlace">{t.verTodos} →</Link>}
    >
      {ciudades.map((ciudad) => (
        <Link
          key={ciudad.clave}
          to={`/tours?ciudad=${ciudad.clave}`}
          className="tarjeta-ciudad"
        >
          <div className="tarjeta-ciudad-foto">
            <img src={ciudad.imagen} alt="" loading="lazy" draggable="false" />
          </div>
          <div className="tarjeta-ciudad-pie">
            <span className="tarjeta-ciudad-nombre">{ciudad.nombre}</span>
            <span className="tarjeta-ciudad-total">
              {ciudad.total} {t.ciudadesTours}
            </span>
          </div>
        </Link>
      ))}
    </CarruselHorizontal>
  );
}

/** Reseñas de viajeros. El contenido vive en datos/resenas.js. */
function SeccionResenas() {
  const { t } = usarIdioma();

  return (
    <CarruselResenas
      entradilla={t.resenasEntradilla}
      titulo={t.resenasTitulo}
      resenas={RESENAS}
    />
  );
}

/** Ultimos articulos del blog, en carrusel. */
function SeccionDiario() {
  const { idioma, t } = usarIdioma();
  const { blogs } = usarBlogs(idioma);

  if (blogs.length === 0) return null;

  return (
    <CarruselHorizontal
      entradilla={t.diarioEntradilla}
      titulo={t.diarioTitulo}
      extra={<Link to="/blogs" className="carrusel-enlace">{t.verTodos} →</Link>}
    >
      {blogs.slice(0, 8).map((blog) => (
        <Link key={blog.id} to={`/blogs?articulo=${blog.id}`} className="tarjeta-diario">
          <div className="tarjeta-diario-foto">
            <img src={blog.imagen} alt="" loading="lazy" draggable="false" />
          </div>
          <div className="tarjeta-diario-cuerpo">
            {blog.categoria && <span className="tarjeta-diario-categoria">{blog.categoria}</span>}
            <h3>{blog.titulo}</h3>
            <p>{blog.resumen}</p>
            <span className="tarjeta-diario-enlace">{t.leerArticulo} →</span>
          </div>
        </Link>
      ))}
    </CarruselHorizontal>
  );
}
