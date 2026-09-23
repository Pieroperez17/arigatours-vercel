/**
 * Catalogo de tours: filtros en una columna lateral que acompana al bajar, y
 * los resultados en rejilla. Al elegir uno, su ficha entra en un cajon por
 * la derecha sin salir del listado.
 *
 * Un mismo componente sirve para tres rutas segun la prop "variante":
 *   · todos      → /tours
 *   · privados   → /tours-privados
 *   · gratuitos  → /free-walking-tours
 *
 * Entiende tres parametros en la direccion:
 *   · ?ciudad=kioto     → deja marcada esa ciudad en los filtros
 *   · ?tour=tour-xxx    → abre directamente la ficha de ese tour
 *   · ?fecha=AAAA-MM-DD → llega ya puesta en la barra de reserva
 *
 * Cada filtro lleva al lado cuantos tours quedarian al elegirlo: asi nadie
 * pulsa una ciudad para encontrarse la lista vacia.
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

const TIPO_POR_VARIANTE = {
  todos: undefined,
  privados: 'privado',
  gratuitos: 'gratuito',
};

// El kanji del borde de la portadilla: 旅 viaje, 私 privado, 歩 caminar.
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

  /*
   * Ciudades por su clave (kioto, himeji…), que es la misma en los tres
   * idiomas, y no por el nombre traducido: si no, una ciudad sin traducir
   * en japones saldria dos veces. El orden es el del panel.
   */
  const ciudades = useMemo(() => {
    const mapa = new Map();

    for (const tour of tours) {
      if (!tour.ciudadClave) continue;
      const tematicaValida = tematicaFiltro === 'todas' || tour.tematica === tematicaFiltro;

      if (!mapa.has(tour.ciudadClave)) {
        mapa.set(tour.ciudadClave, { clave: tour.ciudadClave, nombre: tour.ciudad, total: 0 });
      }
      if (tematicaValida) mapa.get(tour.ciudadClave).total += 1;
    }

    return [...mapa.values()];
  }, [tours, tematicaFiltro]);

  const tematicas = useMemo(() => {
    const mapa = new Map();

    for (const tour of tours) {
      if (!tour.tematica) continue;
      const ciudadValida = ciudadFiltro === 'todas' || tour.ciudadClave === ciudadFiltro;
      mapa.set(tour.tematica, (mapa.get(tour.tematica) || 0) + (ciudadValida ? 1 : 0));
    }

    return [...mapa.entries()].map(([nombre, total]) => ({ nombre, total })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [tours, ciudadFiltro]);

  const filtrados = useMemo(
    () => tours.filter((tour) => {
      const coincideCiudad = ciudadFiltro === 'todas' || tour.ciudadClave === ciudadFiltro;
      const coincideTematica = tematicaFiltro === 'todas' || tour.tematica === tematicaFiltro;
      return coincideCiudad && coincideTematica;
    }),
    [tours, ciudadFiltro, tematicaFiltro]
  );

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

  function elegirTour(tour) {
    setTourElegido(tour);
    cambiarParametro('tour', tour.id);
  }

  function cerrarDetalle() {
    setTourElegido(null);
    cambiarParametro('tour', null);
  }

  const totalTematica = tours.filter((tour) => tematicaFiltro === 'todas' || tour.tematica === tematicaFiltro).length;

  return (
    <>
      <CabeceraPagina {...cabecera} kanji={KANJI_POR_VARIANTE[variante]} />

      <section className="seccion catalogo">
        {cargando && <Cargando mensaje={t.cargandoTours} />}
        {error && <ErrorCarga mensaje={t.errorTours} alReintentar={recargar} />}

        {!cargando && !error && (
          <>
            <aside className="catalogo-filtros">
              <div className="filtro-grupo" role="group" aria-label={t.etiquetaCiudad}>
                <span className="filtro-titulo">{t.etiquetaCiudad}</span>
                <button type="button" aria-pressed={ciudadFiltro === 'todas'} onClick={() => cambiarParametro('ciudad', null)}>
                  {t.filtroTodasCiudades} <small>{totalTematica}</small>
                </button>
                {ciudades.map((ciudad) => (
                  <button
                    key={ciudad.clave}
                    type="button"
                    aria-pressed={ciudadFiltro === ciudad.clave}
                    onClick={() => cambiarParametro('ciudad', ciudad.clave)}
                    disabled={ciudad.total === 0}
                  >
                    {ciudad.nombre} <small>{ciudad.total}</small>
                  </button>
                ))}
              </div>

              {tematicas.length > 1 && (
                <div className="filtro-grupo" role="group" aria-label={t.etiquetaTematica}>
                  <span className="filtro-titulo">{t.etiquetaTematica}</span>
                  <button type="button" aria-pressed={tematicaFiltro === 'todas'} onClick={() => setTematicaFiltro('todas')}>
                    {t.filtroTodasTematicas}
                  </button>
                  {tematicas.map((tematica) => (
                    <button
                      key={tematica.nombre}
                      type="button"
                      aria-pressed={tematicaFiltro === tematica.nombre}
                      onClick={() => setTematicaFiltro(tematica.nombre)}
                      disabled={tematica.total === 0}
                    >
                      {tematica.nombre} <small>{tematica.total}</small>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <div className="catalogo-resultados">
              <p className="catalogo-cuenta" aria-live="polite">
                <b>{filtrados.length}</b> {filtrados.length === 1 ? t.resultado : t.resultados}
              </p>

              {filtrados.length === 0 ? (
                <SinResultados mensaje={t.sinResultados} />
              ) : (
                <div className="rejilla-catalogo">
                  {filtrados.map((tour) => (
                    <TarjetaTour
                      key={tour.id}
                      tour={tour}
                      etiqueta={`${tour.ciudad} · ${tour.tipo === 'gratuito' ? t.tourGratuito : t.tourPrivado}`}
                      alElegir={elegirTour}
                      seleccionada={tourElegido?.id === tour.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <LlamadaFinal />

      <VentanaDetalle
        abierto={Boolean(tourElegido)}
        alCerrar={cerrarDetalle}
        clave={tourElegido?.id}
        titulo={tourElegido?.titulo}
        textoCerrar={t.cerrarDetalle}
        variante="cajon"
      >
        {tourElegido && <DetalleTour tour={tourElegido} fechaConsulta={fechaConsulta} />}
      </VentanaDetalle>
    </>
  );
}
