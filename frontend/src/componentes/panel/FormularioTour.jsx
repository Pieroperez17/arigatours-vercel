/**
 * Formulario para crear y editar tours.
 *
 * Tiene dos partes:
 *   · Datos comunes  → imagenes, ciudad, duracion, orden, visibilidad
 *   · Textos         → una pestania por idioma (ES / EN / JA)
 *
 * Se envia como FormData porque puede incluir archivos. Los textos de los
 * tres idiomas viajan juntos en el campo "traducciones" como JSON.
 */

import { useState, useEffect } from 'react';
import { apiTours } from '../../servicios/clienteApi.js';
import { IDIOMAS } from '../../traducciones/textos.js';

/** Estructura vacia de una traduccion. */
const TRADUCCION_VACIA = {
  titulo: '', ciudad: '', tematica: '', precio: '',
  puntoEncuentro: '', descripcion: '', incluye: [], noIncluye: [],
};

/** Datos comunes de un tour nuevo. */
const TOUR_VACIO = {
  id: '',
  ciudadClave: '',
  tipo: '',
  imagen: '',
  galeria: [],
  duracion: '',
  fechasDisponibles: [],
  orden: 0,
  activo: true,
};

/** Convierte un arreglo en texto con una linea por elemento, y al reves. */
const aLineas = (lista) => (Array.isArray(lista) ? lista.join('\n') : '');
const aLista = (texto) => texto.split('\n').map((linea) => linea.trim()).filter(Boolean);

export default function FormularioTour({ tourAEditar, alGuardar, alCancelar }) {
  const esEdicion = Boolean(tourAEditar);

  const [comunes, setComunes] = useState(TOUR_VACIO);
  const [traducciones, setTraducciones] = useState({ es: { ...TRADUCCION_VACIA } });
  const [idiomaActivo, setIdiomaActivo] = useState('es');

  const [archivoPortada, setArchivoPortada] = useState(null);
  const [archivosGaleria, setArchivosGaleria] = useState([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Al abrir en modo edicion se cargan los datos actuales del tour.
  useEffect(() => {
    if (!tourAEditar) {
      setComunes(TOUR_VACIO);
      setTraducciones({ es: { ...TRADUCCION_VACIA } });
      return;
    }

    const { traducciones: textos, ...resto } = tourAEditar;

    setComunes({ ...TOUR_VACIO, ...resto });
    setTraducciones({
      es: { ...TRADUCCION_VACIA, ...(textos?.es || {}) },
      ...(textos?.en ? { en: { ...TRADUCCION_VACIA, ...textos.en } } : {}),
      ...(textos?.ja ? { ja: { ...TRADUCCION_VACIA, ...textos.ja } } : {}),
    });
  }, [tourAEditar]);

  function cambiarComun(campo, valor) {
    setComunes((actual) => ({ ...actual, [campo]: valor }));
  }

  function cambiarTexto(idioma, campo, valor) {
    setTraducciones((actual) => ({
      ...actual,
      [idioma]: { ...(actual[idioma] || TRADUCCION_VACIA), [campo]: valor },
    }));
  }

  /** Agrega un idioma vacio para empezar a traducir. */
  function agregarIdioma(idioma) {
    setTraducciones((actual) => ({ ...actual, [idioma]: { ...TRADUCCION_VACIA } }));
    setIdiomaActivo(idioma);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      const datos = new FormData();

      datos.append('id', comunes.id);
      datos.append('ciudadClave', comunes.ciudadClave);
      datos.append('duracion', comunes.duracion);
      datos.append('imagen', comunes.imagen);
      datos.append('galeria', aLineas(comunes.galeria));
      datos.append('fechasDisponibles', aLineas(comunes.fechasDisponibles));
      datos.append('orden', String(comunes.orden));
      datos.append('activo', String(comunes.activo));

      // Vacio = que el backend lo deduzca a partir del precio.
      if (comunes.tipo) datos.append('tipo', comunes.tipo);

      datos.append('traducciones', JSON.stringify(traducciones));

      if (archivoPortada) datos.append('archivoImagen', archivoPortada);
      for (const archivo of archivosGaleria) datos.append('archivosGaleria', archivo);

      if (esEdicion) {
        await apiTours.actualizar(tourAEditar.id, datos);
      } else {
        await apiTours.crear(datos);
      }

      alGuardar();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  const idiomasCargados = IDIOMAS.filter((elemento) => traducciones[elemento.codigo]);
  const idiomasPendientes = IDIOMAS.filter((elemento) => !traducciones[elemento.codigo]);
  const textos = traducciones[idiomaActivo] || TRADUCCION_VACIA;

  return (
    <form className="panel-formulario" onSubmit={enviar}>
      <h2>{esEdicion ? `Editar: ${tourAEditar.id}` : 'Nuevo tour'}</h2>

      {error && (
        <div className="panel-aviso error" role="alert">
          <i className="fas fa-circle-exclamation" /> {error}
        </div>
      )}

      {/* ── Datos que no dependen del idioma ── */}
      <fieldset className="panel-grupo">
        <legend>Datos generales</legend>

        <div className="panel-rejilla">
          <div className="panel-campo">
            <label htmlFor="tour-id">Identificador *</label>
            <input
              id="tour-id" type="text" required disabled={esEdicion}
              value={comunes.id}
              onChange={(evento) => cambiarComun('id', evento.target.value)}
              placeholder="tour-kioto-templos"
            />
            <small>Solo letras, números y guiones. No se puede cambiar después.</small>
          </div>

          <div className="panel-campo">
            <label htmlFor="tour-ciudad-clave">Clave de ciudad</label>
            <input
              id="tour-ciudad-clave" type="text"
              value={comunes.ciudadClave}
              onChange={(evento) => cambiarComun('ciudadClave', evento.target.value)}
              placeholder="kioto"
            />
            <small>Si se deja vacío se genera desde la ciudad en español.</small>
          </div>

          <div className="panel-campo">
            <label htmlFor="tour-duracion">Duración</label>
            <input
              id="tour-duracion" type="text"
              value={comunes.duracion}
              onChange={(evento) => cambiarComun('duracion', evento.target.value)}
              placeholder="4 horas"
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="tour-tipo">Tipo</label>
            <select
              id="tour-tipo" value={comunes.tipo}
              onChange={(evento) => cambiarComun('tipo', evento.target.value)}
            >
              <option value="">Automático (según el precio)</option>
              <option value="privado">Tour privado</option>
              <option value="gratuito">Free walking tour</option>
            </select>
          </div>

          <div className="panel-campo">
            <label htmlFor="tour-orden">Orden</label>
            <input
              id="tour-orden" type="number"
              value={comunes.orden}
              onChange={(evento) => cambiarComun('orden', Number(evento.target.value))}
            />
            <small>Número más bajo aparece antes.</small>
          </div>

          <div className="panel-campo panel-campo-casilla">
            <input
              id="tour-activo" type="checkbox"
              checked={comunes.activo}
              onChange={(evento) => cambiarComun('activo', evento.target.checked)}
            />
            <label htmlFor="tour-activo">Visible en la web</label>
          </div>
        </div>
      </fieldset>

      {/* ── Imagenes ── */}
      <fieldset className="panel-grupo">
        <legend>Imágenes</legend>

        <div className="panel-campo">
          <label htmlFor="tour-imagen">Portada (dirección)</label>
          <input
            id="tour-imagen" type="text"
            value={comunes.imagen}
            onChange={(evento) => cambiarComun('imagen', evento.target.value)}
            placeholder="/recursos/Kioto_1.webp"
          />
        </div>

        <div className="panel-campo">
          <label htmlFor="tour-archivo-portada">…o subir una imagen de portada</label>
          <input
            id="tour-archivo-portada" type="file" accept="image/*"
            onChange={(evento) => setArchivoPortada(evento.target.files[0] || null)}
          />
          {archivoPortada && <small>Se subirá: {archivoPortada.name}</small>}
        </div>

        <div className="panel-campo">
          <label htmlFor="tour-galeria">Galería (una dirección por línea)</label>
          <textarea
            id="tour-galeria" rows="4"
            value={aLineas(comunes.galeria)}
            onChange={(evento) => cambiarComun('galeria', aLista(evento.target.value))}
            placeholder={'/recursos/Kioto_1.webp\n/recursos/Kioto_2.webp'}
          />
        </div>

        <div className="panel-campo">
          <label htmlFor="tour-archivos-galeria">…o subir varias fotos a la galería</label>
          <input
            id="tour-archivos-galeria" type="file" accept="image/*" multiple
            onChange={(evento) => setArchivosGaleria([...evento.target.files])}
          />
          {archivosGaleria.length > 0 && <small>{archivosGaleria.length} archivo(s) por subir</small>}
        </div>

        <div className="panel-campo">
          <label htmlFor="tour-fechas">Fechas disponibles (una por línea, AAAA-MM-DD)</label>
          <textarea
            id="tour-fechas" rows="3"
            value={aLineas(comunes.fechasDisponibles)}
            onChange={(evento) => cambiarComun('fechasDisponibles', aLista(evento.target.value))}
            placeholder={'2026-09-15\n2026-09-22'}
          />
        </div>
      </fieldset>

      {/* ── Textos por idioma ── */}
      <fieldset className="panel-grupo">
        <legend>Textos</legend>

        <div className="panel-idiomas">
          {idiomasCargados.map((elemento) => (
            <button
              key={elemento.codigo}
              type="button"
              className={`panel-idioma${idiomaActivo === elemento.codigo ? ' activo' : ''}`}
              onClick={() => setIdiomaActivo(elemento.codigo)}
            >
              {elemento.nombre}
            </button>
          ))}

          {idiomasPendientes.map((elemento) => (
            <button
              key={elemento.codigo}
              type="button"
              className="panel-idioma agregar"
              onClick={() => agregarIdioma(elemento.codigo)}
            >
              <i className="fas fa-plus" /> {elemento.nombre}
            </button>
          ))}
        </div>

        <div className="panel-rejilla">
          <div className="panel-campo">
            <label htmlFor="texto-titulo">Título {idiomaActivo === 'es' && '*'}</label>
            <input
              id="texto-titulo" type="text" required={idiomaActivo === 'es'}
              value={textos.titulo}
              onChange={(evento) => cambiarTexto(idiomaActivo, 'titulo', evento.target.value)}
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="texto-ciudad">Ciudad</label>
            <input
              id="texto-ciudad" type="text"
              value={textos.ciudad}
              onChange={(evento) => cambiarTexto(idiomaActivo, 'ciudad', evento.target.value)}
              placeholder="Kioto"
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="texto-tematica">Temática</label>
            <input
              id="texto-tematica" type="text"
              value={textos.tematica}
              onChange={(evento) => cambiarTexto(idiomaActivo, 'tematica', evento.target.value)}
              placeholder="Tour Privado"
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="texto-precio">Precio</label>
            <input
              id="texto-precio" type="text"
              value={textos.precio}
              onChange={(evento) => cambiarTexto(idiomaActivo, 'precio', evento.target.value)}
              placeholder="25 € (Adultos)"
            />
            <small>Si contiene «propinas» o «tips», el tour se marca como gratuito.</small>
          </div>
        </div>

        <div className="panel-campo">
          <label htmlFor="texto-punto">Punto de encuentro</label>
          <input
            id="texto-punto" type="text"
            value={textos.puntoEncuentro}
            onChange={(evento) => cambiarTexto(idiomaActivo, 'puntoEncuentro', evento.target.value)}
          />
        </div>

        <div className="panel-campo">
          <label htmlFor="texto-descripcion">Descripción</label>
          <textarea
            id="texto-descripcion" rows="8"
            value={textos.descripcion}
            onChange={(evento) => cambiarTexto(idiomaActivo, 'descripcion', evento.target.value)}
          />
          <small>Se admiten etiquetas simples: &lt;br&gt; para saltos y &lt;strong&gt; para negrita.</small>
        </div>

        <div className="panel-rejilla">
          <div className="panel-campo">
            <label htmlFor="texto-incluye">Incluye (uno por línea)</label>
            <textarea
              id="texto-incluye" rows="4"
              value={aLineas(textos.incluye)}
              onChange={(evento) => cambiarTexto(idiomaActivo, 'incluye', aLista(evento.target.value))}
            />
          </div>

          <div className="panel-campo">
            <label htmlFor="texto-no-incluye">No incluye (uno por línea)</label>
            <textarea
              id="texto-no-incluye" rows="4"
              value={aLineas(textos.noIncluye)}
              onChange={(evento) => cambiarTexto(idiomaActivo, 'noIncluye', aLista(evento.target.value))}
            />
          </div>
        </div>
      </fieldset>

      <div className="panel-acciones">
        <button type="submit" className="boton-primario" disabled={guardando}>
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear tour'}
        </button>

        <button type="button" className="boton-suave" onClick={alCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
