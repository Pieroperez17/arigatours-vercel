/**
 * Ficha completa de un tour, pensada para el cajon lateral.
 *
 * Arriba la galeria a sangre; debajo el titulo, tres datos clave y un
 * pequeno indice que salta a cada parte de la ficha. Abajo del todo, fija
 * mientras se lee, la barra de reserva con el precio, la fecha y el boton de
 * WhatsApp: en un cajon estrecho no cabe una columna aparte para ella, y asi
 * sigue a mano sin volver arriba.
 *
 * La fecha elegida viaja en el mensaje de WhatsApp. Puede venir ya puesta en
 * la direccion (?fecha=AAAA-MM-DD) desde un enlace compartido.
 *
 * Nota sobre la descripcion: los textos guardados en la base traen etiquetas
 * HTML simples (<br>, <strong>) heredadas del contenido original, por eso se
 * pintan con dangerouslySetInnerHTML. El contenido lo escribe la propia
 * agencia desde el panel, no visitantes anonimos.
 */

import { useState, useEffect, useRef } from 'react';

import VisorImagenes from './VisorImagenes.jsx';
import {
  IconoChat, IconoCheck, IconoCruz, IconoPunto, IconoReloj, IconoIdioma, IconoGrupo,
  IconoAnterior, IconoSiguiente,
} from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { enlaceWhatsapp } from '../configuracion/sitio.js';

export default function DetalleTour({ tour, fechaConsulta }) {
  const { t } = usarIdioma();

  const [indiceGaleria, setIndiceGaleria] = useState(0);
  const [visorAbierto, setVisorAbierto] = useState(false);
  const [fecha, setFecha] = useState(fechaConsulta || '');

  const secciones = {
    descripcion: useRef(null),
    incluye: useRef(null),
    punto: useRef(null),
  };

  const imagenes = tour.galeria?.length > 0 ? tour.galeria : [tour.imagen].filter(Boolean);
  const esGratuito = tour.tipo === 'gratuito';

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

  // Hoy en hora local: toISOString() va en UTC, 9 horas por detras de Japon.
  const ahora = new Date();
  const hoy = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const indice = [
    { clave: 'descripcion', texto: t.pestaniaDescripcion },
    { clave: 'incluye', texto: t.pestaniaDetalles },
    { clave: 'punto', texto: t.pestaniaPunto },
  ];

  return (
    <article className="ficha">
      {imagenes.length > 0 && (
        <div className="ficha-galeria">
          <div className="galeria-pista" style={{ transform: `translateX(-${indiceGaleria * 100}%)` }}>
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
            <div className="ficha-galeria-controles">
              <button type="button" onClick={() => moverGaleria(-1)} aria-label={t.imagenAnterior}>
                <IconoAnterior tamano={20} />
              </button>
              <span>{String(indiceGaleria + 1).padStart(2, '0')} / {String(imagenes.length).padStart(2, '0')}</span>
              <button type="button" onClick={() => moverGaleria(1)} aria-label={t.imagenSiguiente}>
                <IconoSiguiente tamano={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="ficha-cuerpo">
        <div className="entradilla">{tour.ciudad} · {esGratuito ? t.tourGratuito : t.tourPrivado}</div>
        <h2>{tour.titulo}</h2>

        <ul className="ficha-datos">
          {tour.duracion && <li><IconoReloj tamano={18} /> {tour.duracion}</li>}
          <li><IconoGrupo tamano={18} /> {esGratuito ? t.formatoGrupo : t.formatoPrivado}</li>
          <li><IconoIdioma tamano={18} /> {t.idiomaCorto}</li>
        </ul>

        <nav className="ficha-indice" aria-label={tour.titulo}>
          {indice.map((elemento) => (
            <button
              key={elemento.clave}
              type="button"
              onClick={() => secciones[elemento.clave].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              {elemento.texto}
            </button>
          ))}
        </nav>

        <section ref={secciones.descripcion} className="ficha-seccion">
          <h3>{t.pestaniaDescripcion}</h3>
          <div className="texto-descripcion" dangerouslySetInnerHTML={{ __html: tour.descripcion }} />
        </section>

        <section ref={secciones.incluye} className="ficha-seccion">
          <h3>{t.pestaniaDetalles}</h3>
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
        </section>

        <section ref={secciones.punto} className="ficha-seccion">
          <h3>{t.pestaniaPunto}</h3>
          <p className="punto-encuentro">
            <IconoPunto tamano={20} />
            <span>{tour.puntoEncuentro || t.puntoPorCoordinar}</span>
          </p>
        </section>
      </div>

      <div className="ficha-barra">
        <div className="ficha-precio">
          <span>{t.precioTour}</span>
          <b>{tour.precio || '—'}</b>
        </div>

        <label className="ficha-fecha">
          <span>{t.fechaTour}</span>
          <input type="date" value={fecha} min={hoy} onChange={(evento) => setFecha(evento.target.value)} />
        </label>

        <button type="button" className="boton boton-solido" onClick={abrirWhatsapp}>
          <IconoChat tamano={18} /> {t.reservarWhatsapp}
        </button>
      </div>

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
