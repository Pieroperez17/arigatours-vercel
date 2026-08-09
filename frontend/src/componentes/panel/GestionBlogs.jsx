/**
 * Seccion "Blogs" del panel: listado de articulos y formulario de alta/edicion.
 * Cada articulo se escribe en un solo idioma (a diferencia de los tours).
 */

import { useState, useEffect, useCallback } from 'react';

import { apiBlogs } from '../../servicios/clienteApi.js';
import { Cargando, ErrorCarga } from '../Estado.jsx';
import { IDIOMAS } from '../../traducciones/textos.js';

const BLOG_VACIO = {
  id: '',
  idioma: 'es',
  categoria: '',
  titulo: '',
  autor: '',
  fecha: '',
  imagen: '',
  resumen: '',
  contenido: '',
  publicado: true,
};

export default function GestionBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [formulario, setFormulario] = useState(null);   // null | objeto blog
  const [esNuevo, setEsNuevo] = useState(false);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarBlogs = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      setBlogs(await apiBlogs.listarTodosAdmin());
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarBlogs(); }, [cargarBlogs]);

  function abrirNuevo() {
    setFormulario({ ...BLOG_VACIO });
    setEsNuevo(true);
    setArchivoImagen(null);
  }

  function abrirEdicion(blog) {
    setFormulario({ ...blog });
    setEsNuevo(false);
    setArchivoImagen(null);
  }

  function cambiarCampo(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      const datos = new FormData();

      for (const campo of ['id', 'idioma', 'categoria', 'titulo', 'autor', 'fecha', 'imagen', 'resumen', 'contenido']) {
        datos.append(campo, formulario[campo] ?? '');
      }

      datos.append('publicado', String(formulario.publicado));
      if (archivoImagen) datos.append('archivoImagen', archivoImagen);

      if (esNuevo) {
        await apiBlogs.crear(datos);
      } else {
        await apiBlogs.actualizar(formulario.id, datos);
      }

      setFormulario(null);
      setAviso('Artículo guardado correctamente.');
      await cargarBlogs();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarBlog(blog) {
    if (!window.confirm(`¿Eliminar el artículo "${blog.titulo}"?`)) return;

    try {
      await apiBlogs.eliminar(blog.id);
      setAviso('Artículo eliminado.');
      await cargarBlogs();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  // ── Formulario ──
  if (formulario) {
    return (
      <form className="panel-formulario" onSubmit={guardar}>
        <h2>{esNuevo ? 'Nuevo artículo' : `Editar: ${formulario.id}`}</h2>

        {error && (
          <div className="panel-aviso error" role="alert">
            <i className="fas fa-circle-exclamation" /> {error}
          </div>
        )}

        <div className="panel-rejilla">
          <div className="panel-campo">
            <label htmlFor="blog-id">Identificador *</label>
            <input
              id="blog-id" type="text" required disabled={!esNuevo}
              value={formulario.id}
              onChange={(evento) => cambiarCampo('id', evento.target.value)}
              placeholder="vlog-primavera-kioto"
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="blog-idioma">Idioma</label>
            <select
              id="blog-idioma" value={formulario.idioma}
              onChange={(evento) => cambiarCampo('idioma', evento.target.value)}
            >
              {IDIOMAS.map((elemento) => (
                <option key={elemento.codigo} value={elemento.codigo}>{elemento.nombre}</option>
              ))}
            </select>
          </div>

          <div className="panel-campo">
            <label htmlFor="blog-titulo">Título *</label>
            <input
              id="blog-titulo" type="text" required
              value={formulario.titulo}
              onChange={(evento) => cambiarCampo('titulo', evento.target.value)}
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="blog-categoria">Categoría</label>
            <input
              id="blog-categoria" type="text"
              value={formulario.categoria}
              onChange={(evento) => cambiarCampo('categoria', evento.target.value)}
              placeholder="Tips"
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="blog-autor">Autor</label>
            <input
              id="blog-autor" type="text"
              value={formulario.autor}
              onChange={(evento) => cambiarCampo('autor', evento.target.value)}
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="blog-fecha">Fecha (texto libre)</label>
            <input
              id="blog-fecha" type="text"
              value={formulario.fecha}
              onChange={(evento) => cambiarCampo('fecha', evento.target.value)}
              placeholder="15 Marzo 2026"
            />
          </div>
        </div>

        <div className="panel-campo">
          <label htmlFor="blog-imagen">Imagen (dirección)</label>
          <input
            id="blog-imagen" type="text"
            value={formulario.imagen}
            onChange={(evento) => cambiarCampo('imagen', evento.target.value)}
            placeholder="/recursos/Kioto_1.webp"
          />
        </div>

        <div className="panel-campo">
          <label htmlFor="blog-archivo">…o subir una imagen</label>
          <input
            id="blog-archivo" type="file" accept="image/*"
            onChange={(evento) => setArchivoImagen(evento.target.files[0] || null)}
          />
          {archivoImagen && <small>Se subirá: {archivoImagen.name}</small>}
        </div>

        <div className="panel-campo">
          <label htmlFor="blog-resumen">Resumen</label>
          <textarea
            id="blog-resumen" rows="3"
            value={formulario.resumen}
            onChange={(evento) => cambiarCampo('resumen', evento.target.value)}
          />
        </div>

        <div className="panel-campo">
          <label htmlFor="blog-contenido">Contenido</label>
          <textarea
            id="blog-contenido" rows="10"
            value={formulario.contenido}
            onChange={(evento) => cambiarCampo('contenido', evento.target.value)}
          />
          <small>Se admiten etiquetas simples: &lt;p&gt;, &lt;br&gt;, &lt;strong&gt;.</small>
        </div>

        <div className="panel-campo panel-campo-casilla">
          <input
            id="blog-publicado" type="checkbox"
            checked={formulario.publicado}
            onChange={(evento) => cambiarCampo('publicado', evento.target.checked)}
          />
          <label htmlFor="blog-publicado">Publicado (visible en la web)</label>
        </div>

        <div className="panel-acciones">
          <button type="submit" className="boton-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>

          <button type="button" className="boton-suave" onClick={() => setFormulario(null)}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  // ── Listado ──
  return (
    <section className="panel-seccion">
      <div className="panel-barra">
        <h2>Artículos <span className="panel-contador">{blogs.length}</span></h2>

        <button type="button" className="boton-primario" onClick={abrirNuevo}>
          <i className="fas fa-plus" /> Nuevo artículo
        </button>
      </div>

      {aviso && (
        <div className="panel-aviso exito" role="status">
          <i className="fas fa-circle-check" /> {aviso}
        </div>
      )}

      {cargando && <Cargando mensaje="Cargando artículos…" />}
      {error && <ErrorCarga mensaje={error} alReintentar={cargarBlogs} />}

      {!cargando && !error && (
        <div className="panel-tabla-envoltura">
          <table className="panel-tabla">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Idioma</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td><img src={blog.imagen} alt="" className="panel-miniatura" loading="lazy" /></td>

                  <td>
                    <strong>{blog.titulo}</strong>
                    <br />
                    <small className="panel-id">{blog.id}</small>
                  </td>

                  <td>{blog.categoria || '—'}</td>
                  <td>{blog.idioma.toUpperCase()}</td>
                  <td>{blog.fecha || '—'}</td>

                  <td>
                    <span className={`panel-etiqueta ${blog.publicado ? 'activo' : 'oculto'}`}>
                      {blog.publicado ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>

                  <td className="panel-celda-acciones">
                    <button type="button" className="panel-boton-icono" onClick={() => abrirEdicion(blog)} title="Editar">
                      <i className="fas fa-pen" />
                    </button>

                    <button type="button" className="panel-boton-icono peligro" onClick={() => eliminarBlog(blog)} title="Eliminar">
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
