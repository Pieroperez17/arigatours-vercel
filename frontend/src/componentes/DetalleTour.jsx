/**
 * Ficha completa de un tour, dentro de la ventana de detalle.
 *
 * Dos columnas: a la izquierda todo lo que se lee (galeria, datos clave,
 * descripcion, que incluye y punto de encuentro, uno detras de otro); a la
 * derecha, fijo mientras se baja, el cuadro de reserva con el precio, la
 * fecha y el boton de WhatsApp. Antes el contenido iba en pestanias, y quien
 * miraba solo la primera no llegaba nunca a ver que incluia el precio.
 *
 * La fecha elegida viaja en el mensaje de WhatsApp. Puede venir ya puesta en
 * la direccion (?fecha=AAAA-MM-DD) desde un enlace compartido.
 *
 * Nota sobre la descripcion: los textos guardados en la base traen etiquetas
 * HTML simples (<br>, <strong>) heredadas del contenido original, por eso se
 * pintan con dangerouslySetInnerHTML. El contenido lo escribe la propia
 * agencia desde el panel, no visitantes anonimos.
 */

import { useState, useEffect } from 'react';

import VisorImagenes from './VisorImagenes.jsx';
import {
  IconoChat, IconoCheck, IconoCruz, IconoPunto, IconoAnterior, IconoSiguiente,
} from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { enlaceWhatsapp } from '../configuracion/sitio.js';

export default function DetalleTour({ tour, fechaConsulta }) {
  const { t } = usarIdioma();

  const [indiceGaleria, setIndiceGaleria] = useState(0);
  const [visorAbierto, setVisorAbierto] = useState(false);
  const [fecha, setFecha] = useState(fechaConsulta || '');

  const imagenes = tour.galeria?.length > 0 ? tour.galeria : [tour.imagen].filter(Boolean);
  const esGratuito = tour.tipo === 'gratuito';

  // Al cambiar de tour se vuelve a la primera foto.
  useEffect(() => {
    setIndiceGaleria(0);
  }, [tour.id]);

  function abrirWhatsapp() {
    let mensaje = `${t.mensajeWhatsappInicio} "${tour.titulo}"`;

    if (fecha) {
      const [anio, mes, dia] = fecha.split('-');
      mensaje += ` ${t.mensajeWhatsappFecha} ${dia}/${mes}/${anio}`;
    }

    window.open(enlaceWhatsapp(`${mensaje}.`), '_blank', 'noopener');
  }

  const moverGaleria = (paso) =>
    setIndiceGaleria((actual) => (actual + paso + imagenes.length) % imagenes.length);

  // No se puede consultar una fecha que ya paso. Se calcula en hora local:
  // toISOString() da la fecha en UTC, que en Japon va 9 horas por detras y
  // de madrugada todavia seria "ayer".
  const ahora = new Date();
  const hoy = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  return (
    <article className="detalle">
      <div className="detalle-principal">
        <div className="entradilla">
          {tour.ciudad} · {esGratuito ? t.tourGratuito : t.tourPrivado}
        </div>
        <h2 className="detalle-titulo">{tour.titulo}</h2>

        {imagenes.length > 0 && (
          <div className="galeria">
            <div
              className="galeria-pista"
              style={{ transform: `translateX(-${indiceGaleria * 100}%)` }}
            >
              {imagenes.map((imagen, posicion) => (
                <img
                  key={imagen}
                  src={imagen}
                  alt={`${tour.titulo} ${posicion + 1}`}
                  loading={posicion === 0 ? 'eager' : 'lazy'}
                  onClick={() => { setIndiceGaleria(posicion); setVisorAbierto(true); }}
                />
              ))}
            </div>

            {imagenes.length > 1 && (
              <>
                <button type="button" className="galeria-flecha anterior" onClick={() => moverGaleria(-1)} aria-label={t.imagenAnterior}>
                  <IconoAnterior tamano={22} />
                </button>
                <button type="button" className="galeria-flecha siguiente" onClick={() => moverGaleria(1)} aria-label={t.imagenSiguiente}>
                  <IconoSiguiente tamano={22} />
                </button>
                <span className="galeria-contador">{indiceGaleria + 1} / {imagenes.length}</span>
              </>
            )}
          </div>
        )}

        <div className="datos-tour">
          {tour.duracion && (
            <div><span>{t.duracion}</span><b>{tour.duracion}</b></div>
          )}
          <div><span>{t.detalleFormato}</span><b>{esGratuito ? t.formatoGrupo : t.formatoPrivado}</b></div>
          <div><span>{t.idiomaGuia}</span><b>{t.idiomaCorto}</b></div>
        </div>

        <h3 className="detalle-subtitulo">{t.pestaniaDescripcion}</h3>
        <div className="texto-descripcion" dangerouslySetInnerHTML={{ __html: tour.descripcion }} />

        <h3 className="detalle-subtitulo">{t.pestaniaDetalles}</h3>
        <div className="inclusiones">
          <div>
            <h4>{t.incluido}</h4>
            <ul className="marcas">
              {tour.incluye?.length > 0
                ? tour.incluye.map((elemento) => <li key={elemento}><IconoCheck tamano={16} />{elemento}</li>)
                : <li className="marcas-vacia">{t.sinDetalles}</li>}
            </ul>
          </div>
          <div>
            <h4>{t.noIncluido}</h4>
            <ul className="marcas marcas-no">
              {tour.noIncluye?.length > 0
                ? tour.noIncluye.map((elemento) => <li key={elemento}><IconoCruz tamano={16} />{elemento}</li>)
                : <li className="marcas-vacia">{t.sinEspecificar}</li>}
            </ul>
          </div>
        </div>

        <h3 className="detalle-subtitulo">{t.pestaniaPunto}</h3>
        <p className="punto-encuentro">
          <IconoPunto tamano={20} />
          <span>{tour.puntoEncuentro || t.puntoPorCoordinar}</span>
        </p>
      </div>

      <aside className="reserva" aria-label={t.reservar}>
        <span className="reserva-etiqueta">{t.precioTour}</span>
        <div className="reserva-precio">{tour.precio || '—'}</div>

        <label className="campo">
          <span>{t.fechaTour}</span>
          <input type="date" value={fecha} min={hoy} onChange={(evento) => setFecha(evento.target.value)} />
        </label>

        <button type="button" className="boton boton-solido boton-ancho" onClick={abrirWhatsapp}>
          <IconoChat tamano={18} /> {t.reservarWhatsapp}
        </button>

        <p className="reserva-nota">{t.reservaNota}</p>
      </aside>

      {visorAbierto && (
        <VisorImagenes
          imagenes={imagenes}
          indice={indiceGaleria}
          alCambiar={setIndiceGaleria}
          alCerrar={() => setVisorAbierto(false)}
        />
      )}
    </article>
  );
}
