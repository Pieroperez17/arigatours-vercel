/**
 * Seccion "Portadas" del panel: las fotos de fondo del sitio.
 *
 * La misma lista sirve para el carrusel del inicio y para las cabeceras de
 * las demas paginas, asi que lo que se quita aqui desaparece de los dos
 * sitios. El aviso de arriba lo dice, porque desde esta pantalla no se ve.
 */

import { useState, useEffect, useCallback } from 'react';

import { apiPortadas } from '../../servicios/clienteApi.js';
import { Cargando, ErrorCarga } from '../Estado.jsx';

export default function GestionPortadas() {
  const [portadas, setPortadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargarPortadas = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      setPortadas(await apiPortadas.listarTodasAdmin());
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarPortadas(); }, [cargarPortadas]);

  async function subir(evento) {
    evento.preventDefault();
    setError(null);
    setAviso(null);

    if (!archivo) {
      setError('Elige una imagen antes de añadirla.');
      return;
    }

    setSubiendo(true);

    try {
      const datos = new FormData();
      datos.append('archivoImagen', archivo);
      await apiPortadas.crear(datos);

      setArchivo(null);
      // Vacia el campo de archivo, que no se limpia solo al cambiar el estado.
      evento.target.reset();
      setAviso('Portada añadida correctamente.');
      await cargarPortadas();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setSubiendo(false);
    }
  }

  async function alternar(portada) {
    setError(null);
    setAviso(null);

    try {
      const respuesta = await apiPortadas.cambiarActivo(portada.id, !portada.activo);
      setAviso(respuesta.mensaje);
      await cargarPortadas();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  async function eliminar(portada) {
    if (!window.confirm('¿Quitar esta imagen de las portadas?\n\nEl archivo no se borra: solo deja de mostrarse.')) {
      return;
    }

    setError(null);
    setAviso(null);

    try {
      await apiPortadas.eliminar(portada.id);
      setAviso('Portada eliminada de la lista.');
      await cargarPortadas();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  const activas = portadas.filter((portada) => portada.activo).length;

  return (
    <section className="panel-seccion">
      <div className="panel-barra">
        <h2>Portadas <span className="panel-contador">{activas} activas</span></h2>
      </div>

      <p className="panel-nota">
        Son las fotos de fondo que se van alternando en el carrusel del inicio
        y en las cabeceras del resto de páginas. Lo que quites aquí desaparece
        de los dos sitios.
      </p>

      <form className="portadas-subida" onSubmit={subir}>
        <label htmlFor="portada-archivo">Añadir una foto</label>
        <div className="portadas-subida-fila">
          <input
            id="portada-archivo"
            type="file"
            accept="image/*"
            onChange={(evento) => setArchivo(evento.target.files[0] || null)}
          />
          <button type="submit" className="boton-primario" disabled={subiendo || !archivo}>
            {subiendo ? 'Subiendo…' : 'Añadir'}
          </button>
        </div>
        <small>
          Se ve a pantalla completa y de fondo, así que conviene una foto
          apaisada y de buena resolución.
        </small>
      </form>

      {aviso && (
        <div className="panel-aviso exito" role="status">
          <i className="fas fa-circle-check" /> {aviso}
        </div>
      )}

      {error && (
        <div className="panel-aviso error" role="alert">
          <i className="fas fa-circle-exclamation" /> {error}
        </div>
      )}

      {cargando && <Cargando mensaje="Cargando portadas…" />}
      {!cargando && error && portadas.length === 0 && (
        <ErrorCarga mensaje={error} alReintentar={cargarPortadas} />
      )}

      {!cargando && portadas.length > 0 && (
        <div className="portadas-rejilla">
          {portadas.map((portada) => (
            <figure
              key={portada.id}
              className={`portada-ficha${portada.activo ? '' : ' inactiva'}`}
            >
              <img src={portada.imagen} alt="" loading="lazy" />

              <figcaption>
                <span className={`panel-etiqueta ${portada.activo ? 'activo' : 'oculto'}`}>
                  {portada.activo ? 'Activa' : 'Oculta'}
                </span>

                <div className="portada-ficha-acciones">
                  <button
                    type="button"
                    className="panel-boton-icono"
                    onClick={() => alternar(portada)}
                    title={portada.activo ? 'Ocultar' : 'Mostrar'}
                  >
                    <i className={`fas ${portada.activo ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>

                  <button
                    type="button"
                    className="panel-boton-icono peligro"
                    onClick={() => eliminar(portada)}
                    title="Quitar de las portadas"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
