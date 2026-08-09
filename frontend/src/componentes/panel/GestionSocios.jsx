/**
 * Seccion "Contactos" del panel: las paginas individuales de cada socio.
 *
 * Cada socio tiene una direccion propia (/contacto/daniela) que reparte
 * impresa como QR en su tarjeta. Desde aqui se editan sus datos y se saca el
 * enlace o el QR para mandar a imprimir.
 */

import { useState, useEffect, useCallback } from 'react';

import { apiSocios } from '../../servicios/clienteApi.js';
import { Cargando, ErrorCarga } from '../Estado.jsx';
import CompartirSocio from './CompartirSocio.jsx';

const SOCIO_VACIO = {
  id: '',
  nombre: '',
  cargo: '',
  foto: '',
  whatsapp: '',
  instagram: '',
  correo: '',
  mensajeWhatsapp: '',
  orden: 0,
  activo: true,
};

export default function GestionSocios() {
  const [socios, setSocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [formulario, setFormulario] = useState(null);   // null | objeto socio
  const [esNuevo, setEsNuevo] = useState(false);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Socio cuya ventana de compartir esta abierta, o null
  const [compartiendo, setCompartiendo] = useState(null);

  const cargarSocios = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      setSocios(await apiSocios.listarTodosAdmin());
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarSocios(); }, [cargarSocios]);

  function abrirNuevo() {
    // El orden por defecto deja al nuevo socio al final de la lista.
    setFormulario({ ...SOCIO_VACIO, orden: socios.length + 1 });
    setEsNuevo(true);
    setArchivoImagen(null);
  }

  function abrirEdicion(socio) {
    setFormulario({ ...socio });
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

      for (const campo of ['id', 'nombre', 'cargo', 'foto', 'whatsapp', 'instagram', 'correo', 'mensajeWhatsapp']) {
        datos.append(campo, formulario[campo] ?? '');
      }

      datos.append('orden', String(formulario.orden ?? 0));
      datos.append('activo', String(formulario.activo));
      if (archivoImagen) datos.append('archivoImagen', archivoImagen);

      if (esNuevo) {
        await apiSocios.crear(datos);
      } else {
        await apiSocios.actualizar(formulario.id, datos);
      }

      setFormulario(null);
      setAviso('Página de contacto guardada correctamente.');
      await cargarSocios();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarSocio(socio) {
    /*
     * El aviso menciona las tarjetas a proposito: borrar el socio deja
     * muertos todos los QR ya impresos con su direccion, y eso no se
     * deshace reimprimiendo la pagina.
     */
    const confirmado = window.confirm(
      `¿Eliminar la página de ${socio.nombre}?\n\n` +
      `Los QR ya impresos que apunten a /contacto/${socio.id} dejarán de funcionar.`,
    );
    if (!confirmado) return;

    try {
      await apiSocios.eliminar(socio.id);
      setAviso('Página de contacto eliminada.');
      await cargarSocios();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  // ── Formulario ──
  if (formulario) {
    return (
      <form className="panel-formulario" onSubmit={guardar}>
        <h2>{esNuevo ? 'Nueva página de contacto' : `Editar: ${formulario.nombre}`}</h2>

        {error && (
          <div className="panel-aviso error" role="alert">
            <i className="fas fa-circle-exclamation" /> {error}
          </div>
        )}

        <div className="panel-rejilla">
          <div className="panel-campo">
            <label htmlFor="socio-id">Dirección de la página *</label>
            <input
              id="socio-id" type="text" required disabled={!esNuevo}
              value={formulario.id}
              onChange={(evento) => cambiarCampo('id', evento.target.value)}
              placeholder="daniela"
            />
            <small>
              {esNuevo
                ? 'Será /contacto/… — corta y en minúsculas, se lee en voz alta.'
                : 'No se puede cambiar: los QR ya impresos apuntan aquí.'}
            </small>
          </div>

          <div className="panel-campo">
            <label htmlFor="socio-nombre">Nombre *</label>
            <input
              id="socio-nombre" type="text" required
              value={formulario.nombre}
              onChange={(evento) => cambiarCampo('nombre', evento.target.value)}
              placeholder="Daniela Harada"
            />
          </div>

          <div className="panel-campo panel-campo-ancho">
            <label htmlFor="socio-cargo">Cargo</label>
            <input
              id="socio-cargo" type="text"
              value={formulario.cargo}
              onChange={(evento) => cambiarCampo('cargo', evento.target.value)}
              placeholder="Co-founder &amp; Director · Kansai Region"
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="socio-whatsapp">WhatsApp</label>
            <input
              id="socio-whatsapp" type="text"
              value={formulario.whatsapp}
              onChange={(evento) => cambiarCampo('whatsapp', evento.target.value)}
              placeholder="+81 70-9097-5476"
            />
            <small>Con prefijo del país. Los espacios y guiones se ignoran al abrir el chat.</small>
          </div>

          <div className="panel-campo">
            <label htmlFor="socio-instagram">Instagram</label>
            <input
              id="socio-instagram" type="text"
              value={formulario.instagram}
              onChange={(evento) => cambiarCampo('instagram', evento.target.value)}
              placeholder="haradadaniela"
            />
            <small>Solo el usuario. La arroba y la dirección completa se quitan solas.</small>
          </div>

          <div className="panel-campo">
            <label htmlFor="socio-correo">Correo</label>
            <input
              id="socio-correo" type="email"
              value={formulario.correo}
              onChange={(evento) => cambiarCampo('correo', evento.target.value)}
              placeholder="arigatoursceo@gmail.com"
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="socio-orden">Orden</label>
            <input
              id="socio-orden" type="number" min="0"
              value={formulario.orden}
              onChange={(evento) => cambiarCampo('orden', evento.target.value)}
            />
            <small>De menor a mayor.</small>
          </div>
        </div>

        <div className="panel-campo">
          <label htmlFor="socio-mensaje">Mensaje automático de WhatsApp</label>
          <textarea
            id="socio-mensaje" rows="3"
            value={formulario.mensajeWhatsapp}
            onChange={(evento) => cambiarCampo('mensajeWhatsapp', evento.target.value)}
            placeholder="Hola Daniela, escaneé tu tarjeta de ArigaTours y me gustaría recibir información sobre sus tours en Japón."
          />
          <small>Aparece ya escrito en el chat; la persona solo tiene que enviarlo.</small>
        </div>

        <div className="panel-campo">
          <label htmlFor="socio-foto">Foto</label>
          <input
            id="socio-foto" type="file" accept="image/*"
            onChange={(evento) => setArchivoImagen(evento.target.files[0] || null)}
          />
          <small>
            {formulario.foto
              ? 'Ya tiene foto; sube otra solo si quieres reemplazarla.'
              : 'Sin foto se muestra la inicial del nombre en un círculo.'}
          </small>
        </div>

        <div className="panel-campo panel-campo-casilla">
          <input
            id="socio-activo" type="checkbox"
            checked={formulario.activo}
            onChange={(evento) => cambiarCampo('activo', evento.target.checked)}
          />
          <label htmlFor="socio-activo">Activa (la página responde al escanear el QR)</label>
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
        <h2>Contactos <span className="panel-contador">{socios.length}</span></h2>

        <button type="button" className="boton-primario" onClick={abrirNuevo}>
          <i className="fas fa-plus" /> Nueva página
        </button>
      </div>

      {aviso && (
        <div className="panel-aviso exito" role="status">
          <i className="fas fa-circle-check" /> {aviso}
        </div>
      )}

      {cargando && <Cargando mensaje="Cargando contactos…" />}
      {error && <ErrorCarga mensaje={error} alReintentar={cargarSocios} />}

      {!cargando && !error && (
        <div className="panel-tabla-envoltura">
          <table className="panel-tabla">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>WhatsApp</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {socios.map((socio) => (
                <tr key={socio.id}>
                  <td>
                    {socio.foto ? (
                      <img src={socio.foto} alt="" className="panel-miniatura" loading="lazy" />
                    ) : (
                      <div className="panel-miniatura panel-miniatura-inicial" aria-hidden="true">
                        {socio.nombre.trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>

                  <td>
                    <strong>{socio.nombre}</strong>
                    <br />
                    <small className="panel-id">{socio.cargo || '—'}</small>
                  </td>

                  <td><small className="panel-id">/contacto/{socio.id}</small></td>

                  <td>{socio.whatsapp || '—'}</td>

                  <td>
                    <span className={`panel-etiqueta ${socio.activo ? 'activo' : 'oculto'}`}>
                      {socio.activo ? 'Activa' : 'Oculta'}
                    </span>
                  </td>

                  <td className="panel-celda-acciones">
                    <button
                      type="button" className="panel-boton-icono"
                      onClick={() => setCompartiendo(socio)}
                      title="Compartir enlace o QR"
                    >
                      <i className="fas fa-share-nodes" />
                    </button>

                    <button
                      type="button" className="panel-boton-icono"
                      onClick={() => abrirEdicion(socio)}
                      title="Editar"
                    >
                      <i className="fas fa-pen" />
                    </button>

                    <button
                      type="button" className="panel-boton-icono peligro"
                      onClick={() => eliminarSocio(socio)}
                      title="Eliminar"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {compartiendo && (
        <CompartirSocio socio={compartiendo} alCerrar={() => setCompartiendo(null)} />
      )}
    </section>
  );
}
