/**
 * Listado de tours agrupados por ciudad. Al elegir uno se abre su ficha en
 * una ventana, sin salir de la lista.
 *
 * Un mismo componente sirve para tres rutas segun la prop "variante":
 *   · todos      → /tours
 *   · privados   → /tours-privados
 *   · gratuitos  → /free-walking-tours
 *
 * Entiende tres parametros en la direccion:
 *   · ?ciudad=kioto     → deja marcada esa ciudad en los filtros
 *   · ?tour=tour-xxx    → abre directamente la ficha de ese tour
 *   · ?fecha=AAAA-MM-DD → llega ya puesta en el cuadro de reserva
 *
 * La ciudad elegida se guarda en la direccion y no solo en el estado: asi el
 * enlace del menu (Destinos → Kioto) y un enlace compartido llevan al mismo
 * sitio, y el boton de volver del navegador deshace el filtro.
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import CabeceraPagina from '../componentes/CabeceraPagina.jsx';
import TarjetaTour from '../componentes/TarjetaTour.jsx';
import DetalleTour from '../componentes/DetalleTour.jsx';
import VentanaDetalle from '../componentes/VentanaDetalle.jsx';
import LlamadaFinal from '../componentes/LlamadaFinal.jsx';
import { Cargando, ErrorCarga, SinResultados } from '../componentes/Estado.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { usarTours } from '../ganchos/usarPeticion.js';
import { KANJI_CIUDAD } from '../configuracion/sitio.js';

/** Traduce la variante de la ruta al filtro que entiende la API. */
const TIPO_POR_VARIANTE = {
  todos: undefined,
  privados: 'privado',
  gratuitos: 'gratuito',
};

// El kanji del fondo de la cabecera: 旅 viaje, 私 privado, 歩 caminar.
const KANJI_POR_VARIANTE = { todos: '旅', privados: '私', gratuitos: '歩' };

export default function PaginaTours({ variante = 'todos' }) {
  const { idioma, t } = usarIdioma();
  const [parametros, setParametros] = useSearchParams();

  const { tours, cargando, error, recargar } = usarTours(idioma, TIPO_POR_VARIANTE[variante]);

  const [tematicaFiltro, setTematicaFiltro] = useState('todas');
  const [tourElegido, setTourElegido] = useState(null);

  const ciudadFiltro = parametros.get('ciudad') || 'todas';
  const tourEnDireccion = parametros.get('tour');
  const fechaConsulta = parametros.get('fecha');

  const cabecera = {
    todos: { entradilla: t.navDestinos, titulo: t.destinosTitulo, subtitulo: t.destinosSubtitulo },
    privados: { entradilla: t.navToursPrivados, titulo: t.privadosTitulo, subtitulo: t.privadosSubtitulo },
    gratuitos: { entradilla: t.navFreeTours, titulo: t.freeTitulo, subtitulo: t.freeSubtitulo },
  }[variante];

  /**
   * Nombre visible de cada ciudad, indexado por su clave.
   *
   * Se agrupa SIEMPRE por "ciudadClave" (kioto, himeji…), que es la misma en
   * los tres idiomas, y no por el nombre traducido. Si se agrupara por el
   * nombre, una ciudad sin traducir en japones abriria un grupo aparte
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

  // Las ciudades van en el orden en que las deja el panel, no alfabetico:
  // es el mismo orden de los grupos de abajo, y asi los chips los anticipan.
  const ciudadesDisponibles = useMemo(
    () => [...nombresPorClave.entries()].map(([clave, nombre]) => ({ clave, nombre })),
    [nombresPorClave]
  );

  const tematicasDisponibles = useMemo(
    () => [...new Set(tours.map((tour) => tour.tematica).filter(Boolean))].sort(),
    [tours]
  );

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

  function cambiarParametro(nombre, valor) {
    const nuevos = new URLSearchParams(parametros);
    if (valor) nuevos.set(nombre, valor);
    else nuevos.delete(nombre);
    setParametros(nuevos, { replace: nombre === 'tour' });
  }

  function elegirCiudad(clave) {
    cambiarParametro('ciudad', clave === 'todas' ? null : clave);
  }

  /** Al elegir un tour se guarda tambien en la direccion, para poder compartirla. */
  function elegirTour(tour) {
    setTourElegido(tour);
    cambiarParametro('tour', tour.id);
  }

  function cerrarDetalle() {
    setTourElegido(null);
    cambiarParametro('tour', null);
  }

  return (
    <>
      <CabeceraPagina {...cabecera} kanji={KANJI_POR_VARIANTE[variante]} />

      <section className="seccion">
        {!cargando && !error && tours.length > 0 && (
          <div className="filtros">
            <div className="chips" role="group" aria-label={t.filtroTodasCiudades}>
              <button type="button" aria-pressed={ciudadFiltro === 'todas'} onClick={() => elegirCiudad('todas')}>
                {t.filtroTodasCiudades}
              </button>
              {ciudadesDisponibles.map((ciudad) => (
                <button
                  key={ciudad.clave}
                  type="button"
                  aria-pressed={ciudadFiltro === ciudad.clave}
                  onClick={() => elegirCiudad(ciudad.clave)}
                >
                  {ciudad.nombre}
                </button>
              ))}
            </div>

            {/* La tematica solo aporta algo si hay mas de una en esta lista */}
            {tematicasDisponibles.length > 1 ? (
              <select
                className="selector"
                value={tematicaFiltro}
                onChange={(evento) => setTematicaFiltro(evento.target.value)}
                aria-label={t.filtroTodasTematicas}
              >
                <option value="todas">{t.filtroTodasTematicas}</option>
                {tematicasDisponibles.map((tematica) => (
                  <option key={tematica} value={tematica}>{tematica}</option>
                ))}
              </select>
            ) : (
              <span className="filtros-pista">{t.seleccionaTourAyuda}</span>
            )}
          </div>
        )}

        {cargando && <Cargando mensaje={t.cargandoTours} />}
        {error && <ErrorCarga mensaje={t.errorTours} alReintentar={recargar} />}

        {!cargando && !error && grupos.length === 0 && <SinResultados mensaje={t.sinResultados} />}

        {!cargando && !error && grupos.map((grupo) => (
          <div key={grupo.clave} className="grupo">
            <div className="grupo-cabeza revelar">
              <h2>{grupo.nombre}</h2>
              {KANJI_CIUDAD[grupo.clave] && <span className="grupo-kanji" aria-hidden="true">{KANJI_CIUDAD[grupo.clave]}</span>}
              <span className="grupo-linea" aria-hidden="true" />
              <small>{grupo.tours.length} {grupo.tours.length === 1 ? t.ciudadesTour : t.ciudadesTours}</small>
            </div>

            <div className="rejilla rejilla-3">
              {grupo.tours.map((tour) => (
                <TarjetaTour
                  key={tour.id}
                  tour={tour}
                  etiqueta={tour.tipo === 'gratuito' ? t.tourGratuito : t.tourPrivado}
                  alElegir={elegirTour}
                  seleccionada={tourElegido?.id === tour.id}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <LlamadaFinal />

      <VentanaDetalle
        abierto={Boolean(tourElegido)}
        alCerrar={cerrarDetalle}
        clave={tourElegido?.id}
        titulo={tourElegido?.titulo}
        textoCerrar={t.cerrarDetalle}
        ancha
      >
        {tourElegido && <DetalleTour tour={tourElegido} fechaConsulta={fechaConsulta} />}
      </VentanaDetalle>
    </>
  );
}
