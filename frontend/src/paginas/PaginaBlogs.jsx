/**
 * Blog como revista: las categorias son pestanias, el primer articulo va a
 * doble ancho y el resto en rejilla. Al abrir uno se lee a pantalla
 * completa, con una barra arriba que marca cuanto queda.
 *
 * Entiende ?articulo=ID en la direccion, que es a donde llevan las tarjetas
 * del inicio: sin eso, el clic en un articulo concreto dejaba al visitante
 * en el listado, buscando a mano lo que acababa de elegir.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import VentanaDetalle from '../componentes/VentanaDetalle.jsx';
import { Cargando, ErrorCarga, SinResultados } from '../componentes/Estado.jsx';
import { IconoFlecha } from '../componentes/Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarBlogs } from '../ganchos/usarPeticion.js';

export default function PaginaBlogs() {
  const { idioma, t } = usarIdioma();
  const { blogs, cargando, error, recargar } = usarBlogs(idioma);
  const [parametros, setParametros] = useSearchParams();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [articuloElegido, setArticuloElegido] = useState(null);

  const articuloEnDireccion = parametros.get('articulo');

  useEffect(() => {
    if (!articuloEnDireccion || blogs.length === 0) return;

    const encontrado = blogs.find((blog) => String(blog.id) === articuloEnDireccion);
    if (encontrado) setArticuloElegido(encontrado);
  }, [articuloEnDireccion, blogs]);

  const categorias = useMemo(
    () => [...new Set(blogs.map((blog) => blog.categoria).filter(Boolean))].sort(),
    [blogs]
  );

  const blogsFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return blogs.filter((blog) => {
      const coincideCategoria = categoriaFiltro === 'todas' || blog.categoria === categoriaFiltro;

      const coincideTexto = texto === ''
        || blog.titulo.toLowerCase().includes(texto)
        || blog.resumen.toLowerCase().includes(texto)
        || blog.contenido.toLowerCase().includes(texto);

      return coincideCategoria && coincideTexto;
    });
  }, [blogs, busqueda, categoriaFiltro]);

  function abrirArticulo(blog) {
    setArticuloElegido(blog);
    const nuevos = new URLSearchParams(parametros);
    nuevos.set('articulo', blog.id);
    setParametros(nuevos, { replace: true });
  }

  function cerrarArticulo() {
    setArticuloElegido(null);
    const nuevos = new URLSearchParams(parametros);
    nuevos.delete('articulo');
    setParametros(nuevos, { replace: true });
  }

  return (
    <>
      <CabeceraPagina
        entradilla={t.navBlogs}
        titulo={t.blogsTitulo}
        subtitulo={t.blogsSubtitulo}
        kanji="話"
      />

      <section className="seccion revista">
        <div className="revista-barra">
          <div className="pestanias-revista" role="group" aria-label={t.etiquetaCategoria}>
            <button type="button" aria-pressed={categoriaFiltro === 'todas'} onClick={() => setCategoriaFiltro('todas')}>
              {t.todasCategorias}
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                aria-pressed={categoriaFiltro === categoria}
                onClick={() => setCategoriaFiltro(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>

          <input
            type="search"
            className="buscador-linea"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder={t.buscarArticulos}
            aria-label={t.etiquetaBuscar}
          />
        </div>

        {cargando && <Cargando mensaje={t.cargando} />}
        {error && <ErrorCarga mensaje={error} alReintentar={recargar} />}

        {!cargando && !error && blogsFiltrados.length === 0 && (
          <SinResultados mensaje={t.sinArticulos} />
        )}

        {!cargando && !error && blogsFiltrados.length > 0 && (
          <div className="revista-rejilla">
            {blogsFiltrados.map((blog, indice) => (
              <button
                key={blog.id}
                type="button"
                className={`articulo-tarjeta revelar${indice === 0 ? ' destacado' : ''}`}
                onClick={() => abrirArticulo(blog)}
              >
                <span className="articulo-tarjeta-foto">
                  <img src={blog.imagen} alt="" loading="lazy" />
                </span>
                <span className="articulo-tarjeta-texto">
                  {blog.categoria && <span className="entradilla entradilla-sola">{blog.categoria}</span>}
                  <span className="articulo-tarjeta-titulo">{blog.titulo}</span>
                  <span className="articulo-tarjeta-resumen">{blog.resumen}</span>
                  <span className="articulo-tarjeta-pie">
                    <span>{blog.fecha}{blog.autor ? ` · ${blog.autor}` : ''}</span>
                    <span className="enlace-flecha">{t.leerArticulo} <IconoFlecha tamano={16} /></span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <VentanaDetalle
        abierto={Boolean(articuloElegido)}
        alCerrar={cerrarArticulo}
        clave={articuloElegido?.id}
        titulo={articuloElegido?.titulo}
        textoCerrar={t.cerrarDetalle}
      >
        {articuloElegido && <Articulo articulo={articuloElegido} />}
      </VentanaDetalle>
    </>
  );
}

/**
 * El articulo abierto. La barra de progreso escucha el desplazamiento de la
 * propia ventana (que es la que se mueve, no la pagina) y escribe el avance
 * en una variable CSS: sin estado de React, para no repintar al leer.
 */
function Articulo({ articulo }) {
  const { t } = usarIdioma();
  const barra = useRef(null);

  useEffect(() => {
    const contenedor = barra.current?.closest('.ventana');
    if (!contenedor) return undefined;

    function alDesplazar() {
      const maximo = contenedor.scrollHeight - contenedor.clientHeight;
      const avance = maximo > 0 ? contenedor.scrollTop / maximo : 0;
      barra.current?.style.setProperty('--avance', avance.toFixed(4));
    }

    alDesplazar();
    contenedor.addEventListener('scroll', alDesplazar, { passive: true });
    return () => contenedor.removeEventListener('scroll', alDesplazar);
  }, [articulo.id]);

  return (
    <article className="articulo">
      <span ref={barra} className="articulo-progreso" aria-hidden="true" />

      <div className="articulo-portada">
        <img src={articulo.imagen} alt={articulo.titulo} />
      </div>

      <div className="articulo-cuerpo">
        {articulo.categoria && <div className="entradilla">{articulo.categoria}</div>}
        <h2>{articulo.titulo}</h2>

        <div className="articulo-meta">
          <span>{t.escritoPor} <strong>{articulo.autor}</strong></span>
          <span>{t.publicadoEl} {articulo.fecha}</span>
        </div>

        <div className="articulo-texto" dangerouslySetInnerHTML={{ __html: articulo.contenido }} />
      </div>
    </article>
  );
}
