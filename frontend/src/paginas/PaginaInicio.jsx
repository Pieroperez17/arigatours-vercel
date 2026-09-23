/**
 * Pagina de inicio.
 *
 * El orden sigue el recorrido de quien llega sin conocer la agencia: que
 * hace (portada), donde (franja de ciudades), por que ella (ventajas), que
 * se puede reservar (destacados), como (pasos), la prueba de que funciona
 * (resenas) y, al final, la invitacion a escribir.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import PortadaArco from '../componentes/PortadaArco.jsx';
import TarjetaTour from '../componentes/TarjetaTour.jsx';
import CarruselHorizontal from '../componentes/CarruselHorizontal.jsx';
import SeccionResenas from '../componentes/SeccionResenas.jsx';
import LlamadaFinal from '../componentes/LlamadaFinal.jsx';
import ConEnfasis from '../componentes/ConEnfasis.jsx';
import { Cargando, ErrorCarga } from '../componentes/Estado.jsx';
import { IconoIdioma, IconoMapa, IconoBrujula, IconoChat, IconoReloj } from '../componentes/Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarTours, usarBlogs, usarCiudades } from '../ganchos/usarPeticion.js';
import { RESENAS } from '../datos/resenas.js';
import { enlaceWhatsapp } from '../configuracion/sitio.js';

const DESTACADOS = 4;

export default function PaginaInicio() {
  const { idioma, t } = usarIdioma();
  const { tours, cargando, error, recargar } = usarTours(idioma);

  /*
   * Un destacado por ciudad, en el orden del panel. Tomar sin mas los cuatro
   * primeros dejaba tres de Tokio seguidos, que es donde hay mas tours pero
   * no lo que se quiere ensenar: que se viaja por todo Japon.
   */
  const destacados = useMemo(() => {
    const vistas = new Set();
    const elegidos = [];

    for (const tour of tours) {
      const clave = tour.ciudadClave || tour.ciudad;
      if (vistas.has(clave)) continue;
      vistas.add(clave);
      elegidos.push(tour);
      if (elegidos.length === DESTACADOS) break;
    }

    return elegidos;
  }, [tours]);

  return (
    <>
      <PortadaArco />
      <FranjaCiudades />
      <Beneficios />

      <section className="seccion">
        <div className="cabeza-centrada revelar">
          <div className="entradilla entradilla-sola">{t.destacadosEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.destacadosTitulo} /></h2>
          <p className="entrada">{t.destacadosSubtitulo}</p>
        </div>

        {cargando && <Cargando mensaje={t.cargandoTours} />}
        {error && <ErrorCarga mensaje={t.errorTours} alReintentar={recargar} />}

        {!cargando && !error && (
          <>
            <div className="rejilla rejilla-4">
              {destacados.map((tour) => (
                <TarjetaTour
                  key={tour.id}
                  tour={tour}
                  etiqueta={tour.ciudad}
                  destino={`/tours?tour=${tour.id}`}
                />
              ))}
            </div>

            <div className="centrado">
              <Link to="/tours" className="boton boton-solido">{t.destacadosBoton}</Link>
            </div>
          </>
        )}
      </section>

      <Pasos />
      <SeccionCiudades tours={tours} />
      <SeccionResenas resenas={RESENAS} />
      <SeccionDiario />
      <LlamadaFinal />
    </>
  );
}

/**
 * Franja roja con los nombres de las ciudades desfilando. Los nombres salen
 * de la base, ya traducidos; se repite la lista para que la cinta sea mas
 * ancha que cualquier pantalla y el bucle no deje un hueco al reiniciar.
 */
function FranjaCiudades() {
  const { idioma } = usarIdioma();
  const { ciudades } = usarCiudades(idioma);

  if (ciudades.length === 0) return null;

  const tramo = [...ciudades, ...ciudades];
  const nombres = ciudades.map((ciudad) => ciudad.nombre).join(', ');

  return (
    <div className="franja" role="marquee" aria-label={nombres}>
      <div className="franja-pista" aria-hidden="true">
        {[...tramo, ...tramo].map((ciudad, indice) => (
          <span key={`${ciudad.clave}-${indice}`}>
            {ciudad.nombre}<i>✿</i>
          </span>
        ))}
      </div>
    </div>
  );
}

function Beneficios() {
  const { t } = usarIdioma();

  const lista = [
    { icono: <IconoIdioma tamano={26} />, titulo: t.beneficio1Titulo, texto: t.beneficio1Texto },
    { icono: <IconoMapa tamano={26} />, titulo: t.beneficio2Titulo, texto: t.beneficio2Texto },
    { icono: <IconoBrujula tamano={26} />, titulo: t.beneficio3Titulo, texto: t.beneficio3Texto },
    { icono: <IconoChat tamano={26} />, titulo: t.beneficio4Titulo, texto: t.beneficio4Texto },
  ];

  return (
    <div className="beneficios">
      {lista.map((beneficio) => (
        <div key={beneficio.titulo} className="beneficio revelar">
          <span className="beneficio-icono">{beneficio.icono}</span>
          <h3>{beneficio.titulo}</h3>
          <p>{beneficio.texto}</p>
        </div>
      ))}
    </div>
  );
}

function Pasos() {
  const { t } = usarIdioma();

  const pasos = [
    { titulo: t.paso1Titulo, texto: t.paso1Texto },
    { titulo: t.paso2Titulo, texto: t.paso2Texto },
    { titulo: t.paso3Titulo, texto: t.paso3Texto },
  ];

  return (
    <section className="seccion-roja">
      <div className="entradilla entradilla-clara revelar">{t.pasosEntradilla}</div>
      <h2 className="titulo-seccion titulo-versalitas revelar">{t.pasosTitulo}</h2>

      <div className="pasos">
        {pasos.map((paso, indice) => (
          <div key={paso.titulo} className="paso revelar">
            <span className="paso-numero">{indice + 1}</span>
            <h3>{paso.titulo}</h3>
            <p>{paso.texto}</p>
          </div>
        ))}
      </div>

      <a
        className="boton boton-blanco"
        href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
        target="_blank"
        rel="noreferrer"
      >
        <IconoChat tamano={18} /> {t.pasosBoton}
      </a>
    </section>
  );
}

/**
 * Ciudades donde hay tours, en carrusel de arcos.
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
      clase="carrusel-arcos"
      entradilla={t.ciudadesEntradilla}
      titulo={t.ciudadesTitulo}
      extra={<Link to="/tours" className="enlace-subrayado">{t.verTodos} →</Link>}
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
            <b>{ciudad.nombre}</b>
            <small>{ciudad.total} {ciudad.total === 1 ? t.ciudadesTour : t.ciudadesTours}</small>
          </div>
        </Link>
      ))}
    </CarruselHorizontal>
  );
}

/** Ultimos articulos del blog. */
function SeccionDiario() {
  const { idioma, t } = usarIdioma();
  const { blogs } = usarBlogs(idioma);

  if (blogs.length === 0) return null;

  return (
    <section className="seccion seccion-rosada">
      <div className="cabeza-lado revelar">
        <div>
          <div className="entradilla">{t.diarioEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.diarioTitulo} /></h2>
        </div>
        <Link to="/blogs" className="enlace-subrayado">{t.verTodos} →</Link>
      </div>

      <div className="rejilla rejilla-3">
        {blogs.slice(0, 3).map((blog) => (
          <Link key={blog.id} to={`/blogs?articulo=${blog.id}`} className="tarjeta revelar">
            <div className="tarjeta-foto">
              {blog.categoria && <span className="insignia">{blog.categoria}</span>}
              <img src={blog.imagen} alt="" loading="lazy" />
            </div>
            <div className="tarjeta-cuerpo">
              <h3>{blog.titulo}</h3>
              <p className="tarjeta-resumen">{blog.resumen}</p>
              <div className="tarjeta-datos">
                <span className="tarjeta-duracion"><IconoReloj tamano={16} /> {blog.fecha}</span>
              </div>
              <span className="tarjeta-mas">{t.leerArticulo} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
