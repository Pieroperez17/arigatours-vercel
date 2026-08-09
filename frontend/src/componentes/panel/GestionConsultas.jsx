/**
 * Seccion "Consultas" del panel: mensajes recibidos por el formulario de
 * contacto. Se pueden marcar como atendidas y responder por correo o WhatsApp
 * con un clic.
 *
 * Esta seccion no existia en el proyecto original: alli las consultas solo se
 * enviaban por correo y, si el envio fallaba, se perdian.
 */

import { useState, useEffect, useCallback } from 'react';

import { apiContacto } from '../../servicios/clienteApi.js';
import { Cargando, ErrorCarga, SinResultados } from '../Estado.jsx';

/** Convierte la fecha ISO que devuelve la API a algo legible en español. */
function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Deja solo los digitos del telefono, que es lo que necesita el enlace de WhatsApp. */
function soloDigitos(telefono) {
  return String(telefono || '').replace(/\D/g, '');
}

export default function GestionConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [verSoloPendientes, setVerSoloPendientes] = useState(false);

  const cargarConsultas = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      setConsultas(await apiContacto.listarConsultas());
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarConsultas(); }, [cargarConsultas]);

  async function alternarAtendida(consulta) {
    try {
      await apiContacto.cambiarEstado(consulta.id, !consulta.atendida);

      // Se actualiza solo esa fila, sin volver a pedir toda la lista.
      setConsultas((actuales) => actuales.map((elemento) =>
        elemento.id === consulta.id ? { ...elemento, atendida: !elemento.atendida } : elemento
      ));
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  async function eliminarConsulta(consulta) {
    if (!window.confirm(`¿Eliminar la consulta de ${consulta.nombre}?`)) return;

    try {
      await apiContacto.eliminarConsulta(consulta.id);
      setConsultas((actuales) => actuales.filter((elemento) => elemento.id !== consulta.id));
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  const visibles = verSoloPendientes
    ? consultas.filter((consulta) => !consulta.atendida)
    : consultas;

  const pendientes = consultas.filter((consulta) => !consulta.atendida).length;

  return (
    <section className="panel-seccion">
      <div className="panel-barra">
        <h2>
          Consultas <span className="panel-contador">{consultas.length}</span>
          {pendientes > 0 && <span className="panel-contador pendiente">{pendientes} sin atender</span>}
        </h2>

        <div className="panel-campo-casilla">
          <input
            id="solo-pendientes" type="checkbox"
            checked={verSoloPendientes}
            onChange={(evento) => setVerSoloPendientes(evento.target.checked)}
          />
          <label htmlFor="solo-pendientes">Ver solo pendientes</label>
        </div>
      </div>

      {cargando && <Cargando mensaje="Cargando consultas…" />}
      {error && <ErrorCarga mensaje={error} alReintentar={cargarConsultas} />}

      {!cargando && !error && visibles.length === 0 && (
        <SinResultados mensaje="No hay consultas para mostrar." />
      )}

      {!cargando && !error && visibles.length > 0 && (
        <div className="lista-consultas">
          {visibles.map((consulta) => (
            <article key={consulta.id} className={`consulta${consulta.atendida ? ' atendida' : ''}`}>
              <header className="consulta-cabecera">
                <div>
                  <strong>{consulta.nombre}</strong>
                  <span className="consulta-fecha">{formatearFecha(consulta.creadoEn)}</span>
                </div>

                <div className="consulta-etiquetas">
                  <span className="panel-etiqueta">{consulta.idioma.toUpperCase()}</span>

                  {!consulta.correoEnviado && (
                    <span className="panel-etiqueta oculto" title="Se guardó, pero no se pudo enviar el aviso por correo">
                      Sin correo
                    </span>
                  )}

                  <span className={`panel-etiqueta ${consulta.atendida ? 'activo' : 'pendiente'}`}>
                    {consulta.atendida ? 'Atendida' : 'Pendiente'}
                  </span>
                </div>
              </header>

              <ul className="consulta-datos">
                <li><i className="far fa-envelope" /> {consulta.correo}</li>
                <li><i className="fas fa-phone" /> {consulta.telefono}</li>
                <li><i className="far fa-calendar" /> Viaje: {consulta.fechaViaje}</li>
              </ul>

              <p className="consulta-mensaje">{consulta.mensaje}</p>

              <footer className="consulta-acciones">
                <a className="boton-contorno" href={`mailto:${consulta.correo}`}>
                  <i className="far fa-envelope" /> Responder
                </a>

                {soloDigitos(consulta.telefono) && (
                  <a
                    className="boton-contorno"
                    href={`https://wa.me/${soloDigitos(consulta.telefono)}`}
                    target="_blank" rel="noreferrer"
                  >
                    <i className="fab fa-whatsapp" /> WhatsApp
                  </a>
                )}

                <button type="button" className="boton-contorno" onClick={() => alternarAtendida(consulta)}>
                  <i className={consulta.atendida ? 'fas fa-rotate-left' : 'fas fa-check'} />
                  {consulta.atendida ? ' Marcar pendiente' : ' Marcar atendida'}
                </button>

                <button type="button" className="panel-boton-icono peligro" onClick={() => eliminarConsulta(consulta)} title="Eliminar">
                  <i className="fas fa-trash" />
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
