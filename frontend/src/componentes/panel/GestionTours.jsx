/**
 * Seccion "Tours" del panel: listado completo (incluidos los ocultos)
 * con acciones de crear, editar y eliminar.
 */

import { useState, useEffect, useCallback } from 'react';

import FormularioTour from './FormularioTour.jsx';
import { apiTours } from '../../servicios/clienteApi.js';
import { Cargando, ErrorCarga } from '../Estado.jsx';

export default function GestionTours() {
  const [tours, setTours] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  // null = no hay formulario abierto | 'nuevo' = alta | objeto = edicion
  const [formulario, setFormulario] = useState(null);

  const cargarTours = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      setTours(await apiTours.listarTodosAdmin('es'));
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarTours(); }, [cargarTours]);

  async function abrirEdicion(id) {
    setAviso(null);

    try {
      // Se pide la version completa: trae los textos de los tres idiomas.
      setFormulario(await apiTours.obtenerParaEdicion(id));
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  async function eliminarTour(tour) {
    const confirmado = window.confirm(
      `¿Eliminar el tour "${tour.titulo}"?\n\nSe borrarán también sus traducciones. Esta acción no se puede deshacer.`
    );

    if (!confirmado) return;

    try {
      await apiTours.eliminar(tour.id);
      setAviso(`Tour "${tour.titulo}" eliminado.`);
      await cargarTours();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  async function alGuardar() {
    setFormulario(null);
    setAviso('Cambios guardados correctamente.');
    await cargarTours();
  }

  if (formulario) {
    return (
      <FormularioTour
        tourAEditar={formulario === 'nuevo' ? null : formulario}
        alGuardar={alGuardar}
        alCancelar={() => setFormulario(null)}
      />
    );
  }

  return (
    <section className="panel-seccion">
      <div className="panel-barra">
        <h2>Tours <span className="panel-contador">{tours.length}</span></h2>

        <button type="button" className="boton-primario" onClick={() => setFormulario('nuevo')}>
          <i className="fas fa-plus" /> Nuevo tour
        </button>
      </div>

      {aviso && (
        <div className="panel-aviso exito" role="status">
          <i className="fas fa-circle-check" /> {aviso}
        </div>
      )}

      {cargando && <Cargando mensaje="Cargando tours…" />}
      {error && <ErrorCarga mensaje={error} alReintentar={cargarTours} />}

      {!cargando && !error && (
        <div className="panel-tabla-envoltura">
          <table className="panel-tabla">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Título</th>
                <th>Ciudad</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td>
                    <img src={tour.imagen} alt="" className="panel-miniatura" loading="lazy" />
                  </td>

                  <td>
                    <strong>{tour.titulo}</strong>
                    <br />
                    <small className="panel-id">{tour.id}</small>
                  </td>

                  <td>{tour.ciudad}</td>

                  <td>
                    <span className={`panel-etiqueta ${tour.tipo}`}>
                      {tour.tipo === 'gratuito' ? 'Free walking' : 'Privado'}
                    </span>
                  </td>

                  <td>{tour.precio || '—'}</td>

                  <td>
                    <span className={`panel-etiqueta ${tour.activo ? 'activo' : 'oculto'}`}>
                      {tour.activo ? 'Visible' : 'Oculto'}
                    </span>
                  </td>

                  <td className="panel-celda-acciones">
                    <button type="button" className="panel-boton-icono" onClick={() => abrirEdicion(tour.id)} title="Editar">
                      <i className="fas fa-pen" />
                    </button>

                    <button type="button" className="panel-boton-icono peligro" onClick={() => eliminarTour(tour)} title="Eliminar">
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
