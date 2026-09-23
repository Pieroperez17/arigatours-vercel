/**
 * Blog: tarjetas con buscador y filtro por categoria. Al pulsar una, el
 * articulo completo se abre en una ventana de lectura.
 *
 * Entiende ?articulo=ID en la direccion, que es a donde llevan las tarjetas
 * del inicio: sin eso, el clic en un articulo concreto dejaba al visitante
 * en el listado, buscando a mano lo que acababa de elegir.
 */

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import VentanaDetalle from '../componentes/VentanaDetalle.jsx';
import { Cargando, ErrorCarga, SinResultados } from '../componentes/Estado.jsx';
import { IconoReloj } from '../componentes/Iconos.jsx';
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

      <section className="seccion">
        <div className="buscador">
          <label className="campo">
            <span>{t.etiquetaBuscar}</span>
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder={t.buscarArticulos}
            />
          </label>

          <label className="campo">
            <span>{t.etiquetaCategoria}</span>
            <select value={categoriaFiltro} onChange={(evento) => setCategoriaFiltro(evento.target.value)}>
              <option value="todas">{t.todasCategorias}</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </label>
        </div>

        {cargando && <Cargando mensaje={t.cargando} />}
        {error && <ErrorCarga mensaje={error} alReintentar={recargar} />}

        {!cargando && !error && blogsFiltrados.length === 0 && (
          <SinResultados mensaje={t.sinArticulos} />
        )}

        {!cargando && !error && blogsFiltrados.length > 0 && (
          <div className="rejilla rejilla-3">
            {blogsFiltrados.map((blog) => (
              <button
                key={blog.id}
                type="button"
                className={`tarjeta revelar${articuloElegido?.id === blog.id ? ' seleccionada' : ''}`}
                onClick={() => abrirArticulo(blog)}
              >
                <div className="tarjeta-foto">
                  {blog.categoria && <span className="insignia">{blog.categoria}</span>}
                  <img src={blog.imagen} alt={blog.titulo} loading="lazy" />
                </div>

                <div className="tarjeta-cuerpo">
                  <h3>{blog.titulo}</h3>
                  <p className="tarjeta-resumen">{blog.resumen}</p>
                  <div className="tarjeta-datos">
                    <span className="tarjeta-duracion"><IconoReloj tamano={16} /> {blog.fecha}</span>
                    {blog.autor && <span className="tarjeta-autor">{blog.autor}</span>}
                  </div>
                  <span className="tarjeta-mas">{t.leerArticulo} →</span>
                </div>
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
        {articuloElegido && (
          <article className="articulo">
            <img className="articulo-portada" src={articuloElegido.imagen} alt={articuloElegido.titulo} />

            <div className="articulo-cuerpo">
              {articuloElegido.categoria && <div className="entradilla">{articuloElegido.categoria}</div>}
              <h2>{articuloElegido.titulo}</h2>

              <div className="articulo-meta">
                <span>{t.escritoPor} <strong>{articuloElegido.autor}</strong></span>
                <span>{t.publicadoEl} {articuloElegido.fecha}</span>
              </div>

              <div
                className="articulo-texto"
                dangerouslySetInnerHTML={{ __html: articuloElegido.contenido }}
              />
            </div>
          </article>
        )}
      </VentanaDetalle>
    </>
  );
}
