/**
 * Pagina de inicio, en clave editorial.
 *
 * Se lee como una revista: una portada a pantalla completa, el manifiesto de
 * la agencia con tres cifras reales (sacadas de la base, no escritas a
 * mano), un indice de ciudades, tres tours contados en grande, los
 * principios sobre fondo oscuro, el recorrido en tres pasos, una resena de
 * cada vez, el diario y una foto para cerrar.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import PortadaCine from '../componentes/PortadaCine.jsx';
import IndiceCiudades from '../componentes/IndiceCiudades.jsx';
import SeccionResenas from '../componentes/SeccionResenas.jsx';
import LlamadaFinal from '../componentes/LlamadaFinal.jsx';
import ConEnfasis from '../componentes/ConEnfasis.jsx';
import Contador from '../componentes/Contador.jsx';
import { Cargando, ErrorCarga } from '../componentes/Estado.jsx';
import { IconoFlecha, IconoChat } from '../componentes/Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarTours, usarBlogs } from '../ganchos/usarPeticion.js';
import { RESENAS } from '../datos/resenas.js';
import { PARRAFOS_QUIENES_SOMOS } from '../traducciones/textos.js';
import { SITIO, enlaceWhatsapp } from '../configuracion/sitio.js';

const DESTACADOS = 3;
const LARGO_RESUMEN = 190;
const dosCifras = (numero) => String(numero).padStart(2, '0');

/**
 * Primeras frases de la descripcion, en texto plano. La descripcion trae
 * etiquetas HTML; aqui se quitan y se corta por la ultima palabra entera
 * para que el resumen no termine a mitad de una.
 */
function resumir(html) {
  const texto = (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (texto.length <= LARGO_RESUMEN) return texto;
  const corte = texto.slice(0, LARGO_RESUMEN);
  return `${corte.slice(0, corte.lastIndexOf(' '))}…`;
}

export default function PaginaInicio() {
  const { idioma, t } = usarIdioma();
  const { tours, cargando, error, recargar } = usarTours(idioma);

  /*
   * Las ciudades salen de los propios tours: cuando se anade uno de una
   * ciudad nueva, aparece sola en el indice y en la cifra de arriba. De cada
   * una se toma la foto de su primer tour, el que el panel deja arriba.
   */
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

  // Un destacado por ciudad y solo privados: se cuentan en grande, con precio.
  const destacados = useMemo(() => {
    const vistas = new Set();
    const elegidos = [];

    for (const tour of tours) {
      const clave = tour.ciudadClave || tour.ciudad;
      if (tour.tipo === 'gratuito' || vistas.has(clave)) continue;
      vistas.add(clave);
      elegidos.push(tour);
      if (elegidos.length === DESTACADOS) break;
    }

    return elegidos;
  }, [tours]);

  const parrafos = PARRAFOS_QUIENES_SOMOS[idioma] || PARRAFOS_QUIENES_SOMOS.es;

  return (
    <>
      <PortadaCine />

      <section className="manifiesto">
        <span className="sello sello-pequeno" aria-hidden="true">旅</span>
        <p className="manifiesto-texto revelar">{parrafos[0]}</p>

        <dl className="cifras">
          <div className="revelar">
            <dt><Contador valor={ciudades.length} /></dt>
            <dd>{t.cifrasCiudades}</dd>
          </div>
          <div className="revelar">
            <dt><Contador valor={tours.length} /></dt>
            <dd>{t.ciudadesTours}</dd>
          </div>
          <div className="revelar">
            <dt>{SITIO.resenas.notaTripadvisor.toFixed(1)}</dt>
            <dd>{t.cifrasNota}</dd>
          </div>
        </dl>
      </section>

      <IndiceCiudades ciudades={ciudades} />

      <section className="seccion editorial">
        <div className="cabeza-centrada revelar">
          <div className="entradilla entradilla-sola">{t.destacadosEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.destacadosTitulo} /></h2>
        </div>

        {cargando && <Cargando mensaje={t.cargandoTours} />}
        {error && <ErrorCarga mensaje={t.errorTours} alReintentar={recargar} />}

        {destacados.map((tour, indice) => (
          <article key={tour.id} className={`editorial-fila${indice % 2 ? ' invertida' : ''}`}>
            <Link to={`/tours?tour=${tour.id}`} className="editorial-foto revelar-foto" tabIndex={-1} aria-hidden="true">
              <img src={tour.galeria?.[0] || tour.imagen} alt="" loading="lazy" />
            </Link>

            <div className="editorial-texto revelar">
              <span className="editorial-num">No. {dosCifras(indice + 1)}</span>
              <div className="entradilla">{tour.ciudad} · {t.tourPrivado}</div>
              <h3><Link to={`/tours?tour=${tour.id}`}>{tour.titulo}</Link></h3>
              <p>{resumir(tour.descripcion)}</p>

              <dl className="editorial-datos">
                {tour.duracion && <div><dt>{t.duracion}</dt><dd>{tour.duracion}</dd></div>}
                {tour.precio && <div><dt>{t.precioTour}</dt><dd>{tour.precio}</dd></div>}
              </dl>

              <Link to={`/tours?tour=${tour.id}`} className="enlace-flecha">
                {t.verDetalles} <IconoFlecha tamano={18} />
              </Link>
            </div>
          </article>
        ))}

        {!cargando && !error && (
          <div className="centrado">
            <Link to="/tours" className="boton boton-linea">{t.destacadosBoton}</Link>
          </div>
        )}
      </section>

      <Principios />
      <Recorrido />
      <SeccionResenas resenas={RESENAS} />
      <SeccionDiario />
      <LlamadaFinal />
    </>
  );
}

function Principios() {
  const { t } = usarIdioma();

  const lista = [
    { titulo: t.beneficio1Titulo, texto: t.beneficio1Texto },
    { titulo: t.beneficio2Titulo, texto: t.beneficio2Texto },
    { titulo: t.beneficio3Titulo, texto: t.beneficio3Texto },
    { titulo: t.beneficio4Titulo, texto: t.beneficio4Texto },
  ];

  return (
    <section className="principios">
      <div className="cabeza-lado revelar">
        <div>
          <div className="entradilla entradilla-clara">{t.principiosEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.principiosTitulo} /></h2>
        </div>
      </div>

      <div className="principios-rejilla">
        {lista.map((principio, indice) => (
          <div key={principio.titulo} className="principio revelar">
            <span className="principio-num" aria-hidden="true">{dosCifras(indice + 1)}</span>
            <h3>{principio.titulo}</h3>
            <p>{principio.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Los tres pasos sobre una linea que se dibuja al llegar a ella. */
function Recorrido() {
  const { t } = usarIdioma();

  const pasos = [
    { titulo: t.paso1Titulo, texto: t.paso1Texto },
    { titulo: t.paso2Titulo, texto: t.paso2Texto },
    { titulo: t.paso3Titulo, texto: t.paso3Texto },
  ];

  return (
    <section className="seccion recorrido">
      <div className="cabeza-centrada revelar">
        <div className="entradilla entradilla-sola">{t.pasosEntradilla}</div>
        <h2 className="titulo-seccion">{t.pasosTitulo}</h2>
      </div>

      <ol className="linea-pasos revelar">
        {pasos.map((paso, indice) => (
          <li key={paso.titulo}>
            <span className="linea-pasos-punto">{indice + 1}</span>
            <h3>{paso.titulo}</h3>
            <p>{paso.texto}</p>
          </li>
        ))}
      </ol>

      <div className="centrado">
        <a
          className="boton boton-solido"
          href={enlaceWhatsapp(t.mensajeWhatsappGeneral)}
          target="_blank"
          rel="noreferrer"
        >
          <IconoChat tamano={18} /> {t.pasosBoton}
        </a>
      </div>
    </section>
  );
}

/** Diario en formato revista: el primer articulo grande y los otros al lado. */
function SeccionDiario() {
  const { idioma, t } = usarIdioma();
  const { blogs } = usarBlogs(idioma);

  if (blogs.length === 0) return null;

  const [principal, ...resto] = blogs.slice(0, 3);

  return (
    <section className="seccion diario">
      <div className="cabeza-lado revelar">
        <div>
          <div className="entradilla">{t.diarioEntradilla}</div>
          <h2 className="titulo-seccion"><ConEnfasis texto={t.diarioTitulo} /></h2>
        </div>
        <Link to="/blogs" className="enlace-flecha">{t.verTodos} <IconoFlecha tamano={18} /></Link>
      </div>

      <div className="diario-rejilla">
        <Link to={`/blogs?articulo=${principal.id}`} className="diario-principal revelar">
          <img src={principal.imagen} alt="" loading="lazy" />
          <div>
            {principal.categoria && <span className="entradilla entradilla-clara">{principal.categoria}</span>}
            <h3>{principal.titulo}</h3>
            <p>{principal.resumen}</p>
          </div>
        </Link>

        <div className="diario-lateral">
          {resto.map((blog) => (
            <Link key={blog.id} to={`/blogs?articulo=${blog.id}`} className="diario-fila revelar">
              <img src={blog.imagen} alt="" loading="lazy" />
              <div>
                {blog.categoria && <span className="entradilla entradilla-sola">{blog.categoria}</span>}
                <h3>{blog.titulo}</h3>
                <small>{blog.fecha}</small>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
