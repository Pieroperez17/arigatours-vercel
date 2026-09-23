/**
 * Formulario de contacto.
 *
 * Dos mitades: a la izquierda, sobre rojo, por que escribir y como hacerlo
 * por otros medios; a la derecha, el formulario. Quien prefiere WhatsApp o
 * el telefono lo encuentra sin tener que bajar hasta el pie.
 *
 * La validacion se hace en dos capas: aqui para avisar rapido al visitante,
 * y otra vez en el backend, que es la que realmente protege los datos.
 */

import { useState } from 'react';

import ConEnfasis from '../componentes/ConEnfasis.jsx';
import {
  IconoCorreo, IconoTelefono, IconoChat, IconoEnviar, IconoCheck,
} from '../componentes/Iconos.jsx';
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

  return (
    <section className="contacto">
      <div className="contacto-lado">
        <span className="contacto-kanji" aria-hidden="true">旅</span>

        <div className="entradilla entradilla-clara">{t.navContacto}</div>
        <h1><ConEnfasis texto={t.contactoTitulo} /></h1>
        <p>{t.contactoDescripcion}</p>

        <div className="contacto-enlaces">
          <a href={`mailto:${SITIO.correo}`}><IconoCorreo /> {SITIO.correo}</a>
          <a href={`tel:+${SITIO.whatsapp}`}><IconoTelefono /> {SITIO.telefono}</a>
          <a href={enlaceWhatsapp(t.mensajeWhatsappGeneral)} target="_blank" rel="noreferrer">
            <IconoChat /> WhatsApp
          </a>
        </div>

        <div className="contacto-redes">
          <a href={SITIO.redes.facebook} target="_blank" rel="noreferrer">Facebook</a>
          <a href={SITIO.redes.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={SITIO.redes.tiktok} target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>

      <form className="contacto-formulario" onSubmit={enviar} noValidate>
        <h2>{t.contactoFormTitulo}</h2>

        <label className="campo">
          <span>{t.formNombre} <em className="obligatorio">*</em></span>
          <input
            name="nombre" type="text" required
            value={formulario.nombre} onChange={actualizarCampo}
            placeholder={t.formNombrePlaceholder} autoComplete="name"
          />
        </label>

        <div className="campos-dobles">
          <label className="campo">
            <span>{t.formFecha} <em className="obligatorio">*</em></span>
            <input
              name="fechaViaje" type="date" required
              value={formulario.fechaViaje} onChange={actualizarCampo}
            />
          </label>

          <label className="campo">
            <span>{t.formTelefono} <em className="obligatorio">*</em></span>
            <input
              name="telefono" type="tel" required
              value={formulario.telefono} onChange={actualizarCampo}
              placeholder={t.formTelefonoPlaceholder} autoComplete="tel"
            />
          </label>
        </div>

        <label className="campo">
          <span>{t.formCorreo} <em className="obligatorio">*</em></span>
          <input
            name="correo" type="email" required
            value={formulario.correo} onChange={actualizarCampo}
            placeholder={t.formCorreoPlaceholder} autoComplete="email"
          />
        </label>

        <label className="campo">
          <span>{t.formMensaje} <em className="obligatorio">*</em></span>
          <textarea
            name="mensaje" rows="5" required
            value={formulario.mensaje} onChange={actualizarCampo}
            placeholder={t.formMensajePlaceholder}
          />
        </label>

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
          {!enviando && <IconoEnviar tamano={18} />}
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
