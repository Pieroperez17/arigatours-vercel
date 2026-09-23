/**
 * Formulario de contacto.
 *
 * A la izquierda las vias rapidas (WhatsApp, correo, telefono) como filas
 * grandes, porque la mayoria prefiere escribir por chat; a la derecha el
 * formulario, con campos de una sola linea cuya etiqueta sube al escribir.
 *
 * La validacion se hace en dos capas: aqui para avisar rapido al visitante,
 * y otra vez en el backend, que es la que realmente protege los datos.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';

import TituloPorLineas from '../componentes/TituloPorLineas.jsx';
import { IconoCorreo, IconoTelefono, IconoChat, IconoFlecha, IconoCheck } from '../componentes/Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { apiContacto } from '../servicios/clienteApi.js';
import { SITIO, enlaceWhatsapp } from '../configuracion/sitio.js';

const FORMULARIO_VACIO = {
  nombre: '',
  fechaViaje: '',
  telefono: '',
  correo: '',
  mensaje: '',
};

/*
 * El placeholder de un espacio es a proposito: la etiqueta flotante se
 * decide con :placeholder-shown, que solo funciona si el campo tiene uno.
 */
function Campo({ nombre, etiqueta, tipo = 'text', valor, alCambiar, fijo = false, multilinea = false, ...resto }) {
  const Control = multilinea ? 'textarea' : 'input';

  return (
    <div className={`campo-linea${fijo ? ' fijo' : ''}`}>
      <Control
        id={`contacto-${nombre}`}
        name={nombre}
        type={multilinea ? undefined : tipo}
        value={valor}
        onChange={alCambiar}
        placeholder=" "
        required
        {...resto}
      />
      <label htmlFor={`contacto-${nombre}`}>{etiqueta} <em className="obligatorio">*</em></label>
    </div>
  );
}

export default function PaginaContacto() {
  const { idioma, t } = usarIdioma();

  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'exito' | 'error', texto }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setAviso(null);

    if (!aceptaPrivacidad) {
      setAviso({ tipo: 'error', texto: t.formErrorPrivacidad });
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await apiContacto.enviar({ ...formulario, idioma });

      setAviso({ tipo: 'exito', texto: respuesta.mensaje || t.formExito });
      setFormulario(FORMULARIO_VACIO);
      setAceptaPrivacidad(false);
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message || t.formErrorGeneral });
    } finally {
      setEnviando(false);
    }
  }

  const vias = [
    { icono: <IconoChat />, etiqueta: 'WhatsApp', valor: SITIO.telefono, enlace: enlaceWhatsapp(t.mensajeWhatsappGeneral), externo: true },
    { icono: <IconoCorreo />, etiqueta: t.formCorreo, valor: SITIO.correo, enlace: `mailto:${SITIO.correo}` },
    { icono: <IconoTelefono />, etiqueta: t.formTelefono, valor: SITIO.telefono, enlace: `tel:+${SITIO.whatsapp}` },
  ];

  return (
    <section className="contacto">
      <div className="contacto-intro">
        <nav className="migas" aria-label="Ruta">
          <Link to="/">{t.navInicio}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{t.navContacto}</span>
        </nav>

        <h1><TituloPorLineas texto={t.contactoTitulo} /></h1>
        <p>{t.contactoDescripcion}</p>

        <ul className="contacto-vias">
          {vias.map((via) => (
            <li key={via.etiqueta}>
              <a href={via.enlace} {...(via.externo ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <span className="contacto-vias-icono">{via.icono}</span>
                <span className="contacto-vias-texto">
                  <small>{via.etiqueta}</small>
                  <b>{via.valor}</b>
                </span>
                <IconoFlecha tamano={22} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <form className="contacto-formulario" onSubmit={enviar} noValidate>
        <h2>{t.contactoFormTitulo}</h2>

        <Campo nombre="nombre" etiqueta={t.formNombre} valor={formulario.nombre} alCambiar={actualizarCampo} autoComplete="name" />

        <div className="campos-dobles">
          <Campo nombre="fechaViaje" etiqueta={t.formFecha} tipo="date" valor={formulario.fechaViaje} alCambiar={actualizarCampo} fijo />
          <Campo nombre="telefono" etiqueta={t.formTelefono} tipo="tel" valor={formulario.telefono} alCambiar={actualizarCampo} autoComplete="tel" />
        </div>

        <Campo nombre="correo" etiqueta={t.formCorreo} tipo="email" valor={formulario.correo} alCambiar={actualizarCampo} autoComplete="email" />
        <Campo nombre="mensaje" etiqueta={t.formMensaje} valor={formulario.mensaje} alCambiar={actualizarCampo} multilinea rows="4" />

        <label className="casilla">
          <input
            type="checkbox"
            checked={aceptaPrivacidad}
            onChange={(evento) => setAceptaPrivacidad(evento.target.checked)}
          />
          <span>{t.formPrivacidad}</span>
        </label>

        <button type="submit" className="boton boton-solido" disabled={enviando}>
          {enviando ? t.formEnviando : t.formEnviar}
          {!enviando && <IconoFlecha tamano={18} />}
        </button>

        {aviso && (
          <div className={`aviso ${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
            {aviso.tipo === 'exito' && <IconoCheck tamano={18} />}
            {aviso.texto}
          </div>
        )}
      </form>
    </section>
  );
}
