/**
 * Listado de tours agrupados por ciudad, con la ficha del tour elegido debajo.
 *
 * Un mismo componente sirve para tres rutas segun la prop "variante":
 *   · todos      → /tours
 *   · privados   → /tours-privados
 *   · gratuitos  → /free-walking-tours
 *
 * Entiende dos parametros en la direccion:
 *   · ?ciudad=kioto  → resalta esa ciudad y baja hasta su fila
 *   · ?tour=tour-xxx → abre directamente la ficha de ese tour
 *   · ?fecha=AAAA-MM-DD → se agrega al mensaje de WhatsApp
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import FilaCiudad from '../componentes/FilaCiudad.jsx';
import DetalleTour from '../componentes/DetalleTour.jsx';
import VentanaDetalle from '../componentes/VentanaDetalle.jsx';
import { Cargando, ErrorCarga, SinResultados } from '../componentes/Estado.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarTours } from '../ganchos/usarPeticion.js';

/** Traduce la variante de la ruta al filtro que entiende la API. */
const TIPO_POR_VARIANTE = {
  todos: undefined,
  privados: 'privado',
  gratuitos: 'gratuito',
};

export default function PaginaTours({ variante = 'todos' }) {
  const { idioma, t } = usarIdioma();
  const [parametros, setParametros] = useSearchParams();

  const { tours, cargando, error, recargar } = usarTours(idioma, TIPO_POR_VARIANTE[variante]);

  const [ciudadFiltro, setCiudadFiltro] = useState('todas');
  const [tematicaFiltro, setTematicaFiltro] = useState('todas');
  const [tourElegido, setTourElegido] = useState(null);

  const ciudadEnfocada = parametros.get('ciudad');
  const tourEnDireccion = parametros.get('tour');
  const fechaConsulta = parametros.get('fecha');

  const referenciasSecciones = useRef({});

  const titulos = {
    todos: { titulo: t.destinosTitulo, subtitulo: t.destinosSubtitulo },
    privados: { titulo: t.privadosTitulo, subtitulo: t.privadosSubtitulo },
    gratuitos: { titulo: t.freeTitulo, subtitulo: t.freeSubtitulo },
  }[variante];

  /**
   * Nombre visible de cada ciudad, indexado por su clave.
   *
   * Se agrupa SIEMPRE por "ciudadClave" (kioto, himeji…), que es la misma en
   * los tres idiomas, y no por el nombre traducido. Si se agrupara por el
   * nombre, una ciudad sin traducir en japones abriria una fila aparte
   * ("姫路" y "Himeji" por separado). Para el titulo se usa la primera
   * traduccion disponible de esa ciudad.
   */
  const nombresPorClave = useMemo(() => {
    const mapa = new Map();

    for (const tour of tours) {
      if (!tour.ciudadClave) continue;
      if (!mapa.has(tour.ciudadClave) && tour.ciudad) {
        mapa.set(tour.ciudadClave, tour.ciudad);
      }
    }

    return mapa;
  }, [tours]);

  // ── Opciones de los desplegables, calculadas desde los datos reales ──
  const ciudadesDisponibles = useMemo(
    () => [...nombresPorClave.entries()]
      .map(([clave, nombre]) => ({ clave, nombre }))
      .sort((uno, otro) => uno.nombre.localeCompare(otro.nombre)),
    [nombresPorClave]
  );

  const tematicasDisponibles = useMemo(
    () => [...new Set(tours.map((tour) => tour.tematica).filter(Boolean))].sort(),
    [tours]
  );

  // ── Tours que se muestran tras aplicar los filtros ──
  const toursFiltrados = useMemo(
    () => tours.filter((tour) => {
      const coincideCiudad = ciudadFiltro === 'todas' || tour.ciudadClave === ciudadFiltro;
      const coincideTematica = tematicaFiltro === 'todas' || tour.tematica === tematicaFiltro;
      return coincideCiudad && coincideTematica;
    }),
    [tours, ciudadFiltro, tematicaFiltro]
  );

  // ── Agrupacion por clave de ciudad, respetando el orden de llegada ──
  const grupos = useMemo(() => {
    const mapa = new Map();

    for (const tour of toursFiltrados) {
      const clave = tour.ciudadClave || 'otros';

      if (!mapa.has(clave)) {
        mapa.set(clave, { clave, nombre: nombresPorClave.get(clave) || tour.ciudad || 'Otros', tours: [] });
      }

      mapa.get(clave).tours.push(tour);
    }

    return [...mapa.values()];
  }, [toursFiltrados, nombresPorClave]);

  // ── Abrir el tour que venga en la direccion (?tour=) ──
  useEffect(() => {
    if (!tourEnDireccion || tours.length === 0) return;

    const encontrado = tours.find((tour) => tour.id === tourEnDireccion);
    if (encontrado) setTourElegido(encontrado);
  }, [tourEnDireccion, tours]);

  // ── Bajar hasta la fila de la ciudad resaltada (?ciudad=) ──
  useEffect(() => {
    if (!ciudadEnfocada || grupos.length === 0) return;

    const seccion = referenciasSecciones.current[ciudadEnfocada];
    if (!seccion) return;

    // El requestAnimationFrame espera a que las filas terminen de pintarse.
    const identificador = requestAnimationFrame(() => {
      const alturaBarra = document.querySelector('.navbar')?.offsetHeight || 80;
      const posicion = seccion.getBoundingClientRect().top + window.scrollY - alturaBarra - 16;
      window.scrollTo({ top: posicion, behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(identificador);
  }, [ciudadEnfocada, grupos]);

  /** Al elegir un tour se guarda tambien en la direccion, para poder compartirla. */
  function elegirTour(tour) {
    setTourElegido(tour);

    const nuevos = new URLSearchParams(parametros);
    nuevos.set('tour', tour.id);
    setParametros(nuevos, { replace: true });
  }

  /** Quita el resaltado de ciudad y muestra todas las filas por igual. */
  function quitarEnfoqueCiudad() {
    const nuevos = new URLSearchParams(parametros);
    nuevos.delete('ciudad');
    setParametros(nuevos, { replace: true });
  }

  /** Cierra el panel de detalle y limpia el tour de la direccion. */
  function cerrarDetalle() {
    setTourElegido(null);

    const nuevos = new URLSearchParams(parametros);
    nuevos.delete('tour');
    setParametros(nuevos, { replace: true });
  }

  return (
    <>
      <CabeceraPagina titulo={titulos.titulo} subtitulo={titulos.subtitulo} />

      <div className="pagina">
        <div className="filtros">
          <select
            value={ciudadFiltro}
            onChange={(evento) => setCiudadFiltro(evento.target.value)}
            aria-label={t.filtroTodasCiudades}
          >
            <option value="todas">{t.filtroTodasCiudades}</option>
            {ciudadesDisponibles.map((ciudad) => (
              <option key={ciudad.clave} value={ciudad.clave}>{ciudad.nombre}</option>
            ))}
          </select>

          <select
            value={tematicaFiltro}
            onChange={(evento) => setTematicaFiltro(evento.target.value)}
            aria-label={t.filtroTodasTematicas}
          >
            <option value="todas">{t.filtroTodasTematicas}</option>
            {tematicasDisponibles.map((tematica) => (
              <option key={tematica} value={tematica}>{tematica}</option>
            ))}
          </select>
        </div>

        {cargando && <Cargando mensaje={t.cargandoTours} />}
        {error && <ErrorCarga mensaje={t.errorTours} alReintentar={recargar} />}

        {!cargando && !error && grupos.length === 0 && <SinResultados mensaje={t.sinResultados} />}

        {!cargando && !error && grupos.length > 0 && (
          <div className="contenedor-filas">
            <p className="pista-seleccion">{t.seleccionaTourAyuda}</p>

            {ciudadEnfocada && (
              <button type="button" className="boton-contorno" onClick={quitarEnfoqueCiudad} style={{ marginBottom: '1.5rem' }}>
                × {t.verTodasCiudades}
              </button>
            )}

            {grupos.map((grupo) => (
              <FilaCiudad
                key={grupo.clave}
                ciudad={grupo.nombre}
                tours={grupo.tours}
                tourSeleccionado={tourElegido?.id}
                alSeleccionar={elegirTour}
                estado={
                  !ciudadEnfocada ? 'normal'
                    : grupo.clave === ciudadEnfocada ? 'destacada'
                    : 'atenuada'
                }
                referenciaSeccion={(elemento) => { referenciasSecciones.current[grupo.clave] = elemento; }}
              />
            ))}
          </div>
        )}
      </div>

      <VentanaDetalle
        abierto={Boolean(tourElegido)}
        alCerrar={cerrarDetalle}
        clave={tourElegido?.id}
        titulo={tourElegido?.titulo}
        textoCerrar={t.cerrarDetalle}
      >
        {tourElegido && <DetalleTour tour={tourElegido} fechaConsulta={fechaConsulta} />}
      </VentanaDetalle>
    </>
  );
}
