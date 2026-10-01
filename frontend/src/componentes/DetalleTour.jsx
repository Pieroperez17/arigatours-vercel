/**
 * Ficha completa de un tour, con el formato de pagina que propuso el cliente.
 *
 * Dos columnas: a la izquierda la ciudad, el titulo, la galeria, tres datos
 * clave y las partes de la ficha (sobre este tour, itinerario, punto de
 * encuentro y que incluye); a la derecha, fija mientras se lee, la caja de
 * reserva con el precio, cuantos son, la fecha y el boton de WhatsApp. En
 * pantallas estrechas la caja pasa debajo del contenido.
 *
 * El numero de personas y la fecha viajan en el mensaje de WhatsApp; no
 * cambian el precio, que es el texto que la agencia escribe en el panel. La
 * fecha puede venir ya puesta en la direccion (?fecha=AAAA-MM-DD) desde un
 * enlace compartido.
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
import { reportarClicWhatsapp } from '../servicios/seguimiento.js';

const GRUPOS = ['1–3', '4–6', '7–9', '10+'];

/*
 * Un encabezado dentro de la descripcion: un texto en negrita que termina en
 * dos puntos al principio de una linea, como "<strong>Itinerario:</strong>"
 * (o "<strong>旅程：</strong>", con los dos puntos japoneses). Una negrita
 * suelta a mitad de frase no cuenta.
 */
const ENCABEZADO = /(?:^|<br\s*\/?>)\s*<(strong|b)>\s*([^<]{1,60}?)\s*(?:[:：]\s*<\/\1>|<\/\1>\s*[:：])/gi;

const SALTOS_EN_LOS_BORDES = /^(?:\s|<br\s*\/?>)+|(?:\s|<br\s*\/?>)+$/gi;

/**
 * Parte la descripcion en la introduccion y un apartado por encabezado, para
 * que el itinerario (y lo que venga) tenga su propio titulo en la ficha.
 */
function partirDescripcion(html = '') {
  const encabezados = [...html.matchAll(ENCABEZADO)];
  const limpiar = (trozo) => trozo.replace(SALTOS_EN_LOS_BORDES, '');

  if (encabezados.length === 0) return { introduccion: limpiar(html), apartados: [] };

  const apartados = encabezados.map((encabezado, posicion) => {
    const desde = encabezado.index + encabezado[0].length;
    const hasta = encabezados[posicion + 1]?.index ?? html.length;
    return { titulo: encabezado[2], html: limpiar(html.slice(desde, hasta)) };
  });

  return {
    introduccion: limpiar(html.slice(0, encabezados[0].index)),
    apartados: apartados.filter((apartado) => apartado.html),
  };
}

/**
 * Separa la cifra del resto del precio: "¥25.000 por 2 personas" se pinta
 * como "¥25.000" en grande y "por 2 personas" debajo. Si el precio no empieza
 * por una cifra ("Basado en propinas") se deja entero.
 */
function partirPrecio(texto = '') {
  const partes = texto.match(/^\s*((?:[¥$€£]\s?)?\d[\d.,]*(?:\s?(?:€|USD|EUR|JPY|円))?)\s*(.*)$/);
  return partes ? { cifra: partes[1], resto: partes[2] } : { cifra: null, resto: texto };
}

/** "Entradas" pasa a "entradas" tras "No incluye:", pero "JR Pass" se queda igual. */
function enMinuscula(texto) {
  return /^\p{Lu}\p{Ll}/u.test(texto) ? texto.charAt(0).toLowerCase() + texto.slice(1) : texto;
}

export default function DetalleTour({ tour, fechaConsulta }) {
  const { t } = usarIdioma();

  const [indiceGaleria, setIndiceGaleria] = useState(0);
  const [visorAbierto, setVisorAbierto] = useState(false);
  const [fecha, setFecha] = useState(fechaConsulta || '');
  const [grupo, setGrupo] = useState(null);

  const imagenes = tour.galeria?.length > 0 ? tour.galeria : [tour.imagen].filter(Boolean);
  const esGratuito = tour.tipo === 'gratuito';
  const { introduccion, apartados } = partirDescripcion(tour.descripcion);
  const precio = partirPrecio(tour.precio || '');

  useEffect(() => {
    setIndiceGaleria(0);
    setGrupo(null);
  }, [tour.id]);

  function abrirWhatsapp() {
    let mensaje = `${t.mensajeWhatsappInicio} "${tour.titulo}"`;

    if (fecha) {
      const [anio, mes, dia] = fecha.split('-');
      mensaje += ` ${t.mensajeWhatsappFecha} ${dia}/${mes}/${anio}`;
    }

    if (grupo && !esGratuito) mensaje += `, ${t.mensajeWhatsappGrupo.replace('{grupo}', grupo)}`;

    reportarClicWhatsapp();
    window.open(enlaceWhatsapp(`${mensaje}.`), '_blank', 'noopener');
  }

  const moverGaleria = (paso) =>
    setIndiceGaleria((actual) => (actual + paso + imagenes.length) % imagenes.length);

  // Hoy en hora local: toISOString() va en UTC, 9 horas por detras de Japon.
  const ahora = new Date();
  const hoy = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  return (
    <article className="ficha">
      <div className="ficha-principal">
        <div className="entradilla">{tour.ciudad} · {esGratuito ? t.tourGratuito : t.tourPrivado}</div>
        <h2 className="ficha-titulo">{tour.titulo}</h2>

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

        <dl className="ficha-hechos">
          {tour.duracion && (
            <div><dt>{t.duracion}</dt><dd>{tour.duracion}</dd></div>
          )}
          <div><dt>{t.detalleFormato}</dt><dd>{esGratuito ? t.formatoGrupo : t.formatoPrivado}</dd></div>
          <div><dt>{t.idiomaGuia}</dt><dd>{t.idiomaCorto}</dd></div>
        </dl>

        {introduccion && (
          <section className="ficha-apartado">
            <h3>{t.sobreEsteTour}</h3>
            <div className="texto-descripcion" dangerouslySetInnerHTML={{ __html: introduccion }} />
          </section>
        )}

        {apartados.map((apartado) => (
          <section key={apartado.titulo} className="ficha-apartado">
            <h3>{apartado.titulo}</h3>
            <div className="texto-descripcion" dangerouslySetInnerHTML={{ __html: apartado.html }} />
          </section>
        ))}

        <section className="ficha-apartado">
          <h3>{t.pestaniaPunto}</h3>
          <p className="punto-encuentro">
            <IconoPunto tamano={20} />
            <span>{tour.puntoEncuentro || t.puntoPorCoordinar}</span>
          </p>
        </section>

        <section className="ficha-apartado">
          <h3>{t.queIncluye}</h3>
          <div className="inclusiones">
            <ul className="marcas">
              {tour.incluye?.length > 0
                ? tour.incluye.map((elemento) => <li key={elemento}><IconoCheck tamano={16} />{elemento}</li>)
                : <li className="marcas-vacia">{t.sinDetalles}</li>}
            </ul>
            {tour.noIncluye?.length > 0 && (
              <ul className="marcas marcas-no">
                {tour.noIncluye.map((elemento) => (
                  <li key={elemento}>
                    <IconoCruz tamano={16} />
                    <span>{t.noIncluyePrefijo} {enMinuscula(elemento)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <aside className="ficha-reserva" aria-label={t.reservarWhatsapp}>
        <span className="ficha-reserva-etiqueta">{t.precioTour}</span>
        {precio.cifra ? (
          <div className="ficha-reserva-precio">
            <b>{precio.cifra}</b>
            {precio.resto && <small>{precio.resto}</small>}
          </div>
        ) : (
          <div className="ficha-reserva-precio ficha-reserva-precio-texto">
            <b>{precio.resto || '—'}</b>
          </div>
        )}

        {!esGratuito && (
          <div className="ficha-campo">
            <span id={`grupo-${tour.id}`}>{t.cuantosSon}</span>
            <div className="ficha-grupos" role="group" aria-labelledby={`grupo-${tour.id}`}>
              {GRUPOS.map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  aria-pressed={grupo === opcion}
                  onClick={() => setGrupo((actual) => (actual === opcion ? null : opcion))}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="ficha-campo">
          <span>{t.fechaTour}</span>
          <input type="date" value={fecha} min={hoy} onChange={(evento) => setFecha(evento.target.value)} />
        </label>

        <button type="button" className="ficha-reserva-boton" onClick={abrirWhatsapp}>
          <IconoChat tamano={18} /> {t.reservarWhatsapp}
        </button>

        <p className="ficha-reserva-nota">{t.reservaNota}</p>
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
