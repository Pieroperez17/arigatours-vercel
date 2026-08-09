/**
 * Formulario de contacto.
 *
 * La validacion se hace en dos capas: aqui para avisar rapido al visitante,
 * y otra vez en el backend, que es la que realmente protege los datos.
 */

import { useState } from 'react';

import { usarIdioma } from '../contexto/ContextoIdioma.jsx';
import { apiContacto } from '../servicios/clienteApi.js';
import { SITIO, recurso } from '../configuracion/sitio.js';

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
    <section
      className="seccion-contacto"
      style={{
        backgroundImage:
          `linear-gradient(rgba(10,10,15,0.86), rgba(10,10,15,0.86)), url('${recurso('kYOTO2.webp')}')`,
      }}
    >
      <div className="contacto-columnas">
        <div className="contacto-info">
          <h2>{t.contactoTitulo}</h2>
          <p>{t.contactoDescripcion}</p>

          <ul className="contacto-datos">
            <li><i className="far fa-envelope" /> {SITIO.correo}</li>
            <li><i className="fas fa-phone" /> {SITIO.telefono}</li>
            <li>
              <i className="fab fa-whatsapp" />
              <a href={`https://wa.me/${SITIO.whatsapp}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
          </ul>

          <div className="contacto-redes">
            <a href={SITIO.redes.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f" />
            </a>
            <a href={SITIO.redes.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram" />
            </a>
            <a href={SITIO.redes.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
              <i className="fab fa-tiktok" />
            </a>
          </div>
        </div>

        <div className="contacto-formulario">
          {aviso && (
            <div className={`aviso ${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
              <i className={aviso.tipo === 'exito' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'} />
              {' '}{aviso.texto}
            </div>
          )}

          <form onSubmit={enviar} noValidate>
            <div className="campo">
              <label htmlFor="nombre">{t.formNombre} <span className="obligatorio">*</span></label>
              <input
                id="nombre" name="nombre" type="text" required
                value={formulario.nombre} onChange={actualizarCampo}
                placeholder={t.formNombrePlaceholder} autoComplete="name"
              />
            </div>

            <div className="campo">
              <label htmlFor="fechaViaje">{t.formFecha} <span className="obligatorio">*</span></label>
              <input
                id="fechaViaje" name="fechaViaje" type="date" required
                value={formulario.fechaViaje} onChange={actualizarCampo}
              />
            </div>

            <div className="campo">
              <label htmlFor="telefono">{t.formTelefono} <span className="obligatorio">*</span></label>
              <input
                id="telefono" name="telefono" type="tel" required
                value={formulario.telefono} onChange={actualizarCampo}
                placeholder={t.formTelefonoPlaceholder} autoComplete="tel"
              />
            </div>

            <div className="campo">
              <label htmlFor="correo">{t.formCorreo} <span className="obligatorio">*</span></label>
              <input
                id="correo" name="correo" type="email" required
                value={formulario.correo} onChange={actualizarCampo}
                placeholder={t.formCorreoPlaceholder} autoComplete="email"
              />
            </div>

            <div className="campo">
              <label htmlFor="mensaje">{t.formMensaje} <span className="obligatorio">*</span></label>
              <textarea
                id="mensaje" name="mensaje" rows="4" required
                value={formulario.mensaje} onChange={actualizarCampo}
                placeholder={t.formMensajePlaceholder}
              />
            </div>

            <div className="campo-casilla">
              <input
                id="privacidad" type="checkbox"
                checked={aceptaPrivacidad}
                onChange={(evento) => setAceptaPrivacidad(evento.target.checked)}
              />
              <label htmlFor="privacidad">{t.formPrivacidad}</label>
            </div>

            <button type="submit" className="boton-primario" disabled={enviando}>
              {enviando ? t.formEnviando : t.formEnviar}
              {!enviando && <i className="fas fa-paper-plane" style={{ marginLeft: 8 }} />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
