/**
 * Selector visual de fotos para el panel.
 *
 * Sustituye a los campos de texto donde habia que escribir rutas como
 * "/recursos/Kamakura2.webp": eso solo lo puede usar quien sepa que hay
 * detras. Aqui se ven las fotos, se anaden con un boton y se quitan con una
 * equis, que es como funciona en cualquier sitio.
 *
 * Sirve para los dos casos del formulario de tour:
 *   · portada  → una sola foto (multiple = false)
 *   · galeria  → varias, en rejilla
 *
 * Maneja a la vez las fotos ya guardadas (que llegan como direccion) y las
 * que aun no se han subido (archivos elegidos hace un momento). Las segundas
 * se previsualizan con URL.createObjectURL para que se vean antes de guardar,
 * no despues.
 */

import { useRef, useState, useEffect } from 'react';

export default function SelectorFotos({
  etiqueta,
  ayuda,
  multiple = false,
  // Fotos ya guardadas, como direcciones
  direcciones = [],
  alCambiarDirecciones,
  // Fotos elegidas y pendientes de subir, como File
  archivos = [],
  alCambiarArchivos,
}) {
  const campoArchivo = useRef(null);
  const [mostrarDireccion, setMostrarDireccion] = useState(false);
  const [direccionEscrita, setDireccionEscrita] = useState('');

  /*
   * Las vistas previas de los archivos pendientes son URLs que el navegador
   * mantiene en memoria hasta que se le dice lo contrario. Sin revocarlas al
   * cambiar la seleccion, cada foto que se elige y se descarta se queda
   * ocupando memoria mientras el panel siga abierto.
   */
  const [vistasPrevias, setVistasPrevias] = useState([]);

  useEffect(() => {
    const urls = archivos.map((archivo) => URL.createObjectURL(archivo));
    setVistasPrevias(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [archivos]);

  function elegirArchivos(evento) {
    const elegidos = [...evento.target.files];
    if (elegidos.length === 0) return;

    alCambiarArchivos(multiple ? [...archivos, ...elegidos] : elegidos.slice(0, 1));

    // Si es de una sola foto, la nueva sustituye a la direccion que hubiera.
    if (!multiple) alCambiarDirecciones([]);

    // Se limpia para poder volver a elegir el mismo archivo si hace falta.
    evento.target.value = '';
  }

  function quitarDireccion(indice) {
    alCambiarDirecciones(direcciones.filter((_, i) => i !== indice));
  }

  function quitarArchivo(indice) {
    alCambiarArchivos(archivos.filter((_, i) => i !== indice));
  }

  function anadirDireccion() {
    const limpia = direccionEscrita.trim();
    if (!limpia) return;

    alCambiarDirecciones(multiple ? [...direcciones, limpia] : [limpia]);
    if (!multiple) alCambiarArchivos([]);
    setDireccionEscrita('');
    setMostrarDireccion(false);
  }

  const total = direcciones.length + archivos.length;

  return (
    <div className="selector-fotos">
      <div className="selector-fotos-cabecera">
        <span className="selector-fotos-etiqueta">{etiqueta}</span>
        {multiple && total > 0 && (
          <span className="panel-contador">{total}</span>
        )}
      </div>

      {total === 0 ? (
        <button
          type="button"
          className="selector-fotos-vacio"
          onClick={() => campoArchivo.current?.click()}
        >
          <i className="fas fa-image" />
          <span>{multiple ? 'Elegir fotos' : 'Elegir una foto'}</span>
        </button>
      ) : (
        <div className={`selector-fotos-rejilla${multiple ? '' : ' unica'}`}>
          {/* Ya guardadas */}
          {direcciones.map((direccion, indice) => (
            <figure key={direccion} className="selector-foto">
              <img src={direccion} alt="" loading="lazy" />
              <button
                type="button"
                className="selector-foto-quitar"
                onClick={() => quitarDireccion(indice)}
                aria-label="Quitar esta foto"
                title="Quitar"
              >
                <i className="fas fa-xmark" />
              </button>
            </figure>
          ))}

          {/* Elegidas y aun sin subir */}
          {archivos.map((archivo, indice) => (
            <figure key={archivo.name + indice} className="selector-foto pendiente">
              <img src={vistasPrevias[indice]} alt="" />
              <span className="selector-foto-aviso">Sin guardar</span>
              <button
                type="button"
                className="selector-foto-quitar"
                onClick={() => quitarArchivo(indice)}
                aria-label="Quitar esta foto"
                title="Quitar"
              >
                <i className="fas fa-xmark" />
              </button>
            </figure>
          ))}

          {/* En la galeria se puede seguir anadiendo; en la portada, cambiar */}
          <button
            type="button"
            className="selector-foto-anadir"
            onClick={() => campoArchivo.current?.click()}
          >
            <i className="fas fa-plus" />
            <span>{multiple ? 'Añadir' : 'Cambiar'}</span>
          </button>
        </div>
      )}

      <input
        ref={campoArchivo}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={elegirArchivos}
        hidden
      />

      {ayuda && <small className="selector-fotos-ayuda">{ayuda}</small>}

      {/*
        La opcion de pegar una direccion se conserva, pero escondida: la usa
        quien trae una foto ya publicada en otro sitio, y estorba al resto.
      */}
      {mostrarDireccion ? (
        <div className="selector-fotos-direccion">
          <input
            type="text"
            value={direccionEscrita}
            onChange={(evento) => setDireccionEscrita(evento.target.value)}
            placeholder="https://… o /recursos/foto.webp"
          />
          <button type="button" className="boton-suave" onClick={anadirDireccion}>
            Añadir
          </button>
          <button
            type="button"
            className="boton-suave"
            onClick={() => { setMostrarDireccion(false); setDireccionEscrita(''); }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="selector-fotos-enlace"
          onClick={() => setMostrarDireccion(true)}
        >
          o pegar la dirección de una foto
        </button>
      )}
    </div>
  );
}
