/**
 * Blog: tarjetas con buscador y filtro por categoria, y el articulo completo
 * debajo al hacer clic en una tarjeta.
 */

import { useState, useMemo } from 'react';

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import VentanaDetalle from '../componentes/VentanaDetalle.jsx';
import { Cargando, ErrorCarga, SinResultados } from '../componentes/Estado.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarBlogs } from '../ganchos/usarPeticion.js';

export default function PaginaBlogs() {
  const { idioma, t } = usarIdioma();
  const { blogs, cargando, error, recargar } = usarBlogs(idioma);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [articuloElegido, setArticuloElegido] = useState(null);

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

  return (
    <>
      <CabeceraPagina titulo={t.blogsTitulo} subtitulo={t.blogsSubtitulo} />

      <div className="pagina">
        <div className="filtros">
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder={t.buscarArticulos}
            aria-label={t.buscarArticulos}
          />

          <select
            value={categoriaFiltro}
            onChange={(evento) => setCategoriaFiltro(evento.target.value)}
            aria-label={t.todasCategorias}
          >
            <option value="todas">{t.todasCategorias}</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        {cargando && <Cargando mensaje={t.cargando} />}
        {error && <ErrorCarga mensaje={error} alReintentar={recargar} />}

        {!cargando && !error && blogsFiltrados.length === 0 && (
          <SinResultados mensaje={t.sinArticulos} />
        )}

        {!cargando && !error && blogsFiltrados.length > 0 && (
          <>
            <p className="pista-seleccion">{t.seleccionaArticuloAyuda}</p>

            <div className="rejilla-blogs">
              {blogsFiltrados.map((blog) => (
                <button
                  key={blog.id}
                  type="button"
                  className={`tarjeta-blog${articuloElegido?.id === blog.id ? ' seleccionada' : ''}`}
                  onClick={() => setArticuloElegido(blog)}
                >
                  <img src={blog.imagen} alt={blog.titulo} loading="lazy" />

                  <div className="tarjeta-blog-cuerpo">
                    {blog.categoria && <span className="insignia">{blog.categoria}</span>}
                    <h3>{blog.titulo}</h3>

                    <div className="tarjeta-blog-meta">
                      <span><i className="far fa-calendar" /> {blog.fecha}</span>
                      <span><i className="fas fa-user-pen" /> {blog.autor}</span>
                    </div>

                    <p>{blog.resumen}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <VentanaDetalle
        abierto={Boolean(articuloElegido)}
        alCerrar={() => setArticuloElegido(null)}
        clave={articuloElegido?.id}
        titulo={articuloElegido?.titulo}
        textoCerrar={t.cerrarDetalle}
      >
        {articuloElegido && (
          <article className="articulo">
            <h2>{articuloElegido.titulo}</h2>

            <div className="articulo-meta">
              <span>
                <i className="fas fa-circle-user" /> {t.escritoPor}: <strong>{articuloElegido.autor}</strong>
              </span>
              <span><i className="far fa-calendar" /> {t.publicadoEl}: {articuloElegido.fecha}</span>
            </div>

            <img src={articuloElegido.imagen} alt={articuloElegido.titulo} />

            <div
              className="articulo-texto"
              dangerouslySetInnerHTML={{ __html: articuloElegido.contenido }}
            />
          </article>
        )}
      </VentanaDetalle>
    </>
  );
}
