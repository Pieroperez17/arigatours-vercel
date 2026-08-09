/**
 * Envio de correos con Nodemailer (formulario de contacto).
 *
 * Si no hay credenciales SMTP configuradas el modulo queda desactivado:
 * no lanza error, simplemente informa que no envio nada. Asi la web sigue
 * funcionando y la consulta igual queda guardada en la base de datos.
 */

import nodemailer from 'nodemailer';

let transporte = null;

/** Crea el transporte una sola vez (patron perezoso). */
function obtenerTransporte() {
  if (transporte) return transporte;

  if (!process.env.SMTP_USUARIO || !process.env.SMTP_CLAVE) {
    return null;
  }

  transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PUERTO) || 587,
    secure: process.env.SMTP_SEGURO === 'true',
    auth: {
      user: process.env.SMTP_USUARIO,
      pass: process.env.SMTP_CLAVE,
    },
  });

  return transporte;
}

/** Escapa caracteres HTML para que el mensaje del visitante no inyecte etiquetas. */
function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Envia la consulta de contacto al correo de la agencia.
 * Devuelve true si se envio, false si el correo esta desactivado.
 */
export async function enviarCorreoConsulta({ nombre, correo, telefono, fechaViaje, mensaje }) {
  const emisor = obtenerTransporte();

  if (!emisor) {
    console.warn('[correo] SMTP no configurado: la consulta solo se guardo en la base de datos.');
    return false;
  }

  const destino = process.env.CORREO_DESTINO || process.env.SMTP_USUARIO;

  const cuerpoHtml = `
    <h2>Nueva consulta desde la web</h2>
    <table cellpadding="8" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
      <tr><td><strong>Nombre</strong></td><td>${escaparHtml(nombre)}</td></tr>
      <tr><td><strong>Correo</strong></td><td>${escaparHtml(correo)}</td></tr>
      <tr><td><strong>Telefono</strong></td><td>${escaparHtml(telefono)}</td></tr>
      <tr><td><strong>Fecha estimada</strong></td><td>${escaparHtml(fechaViaje)}</td></tr>
      <tr><td valign="top"><strong>Mensaje</strong></td><td>${escaparHtml(mensaje).replace(/\n/g, '<br>')}</td></tr>
    </table>
  `;

  const cuerpoTexto = [
    'Nueva consulta desde la web',
    '',
    `Nombre: ${nombre}`,
    `Correo: ${correo}`,
    `Telefono: ${telefono}`,
    `Fecha estimada: ${fechaViaje}`,
    '',
    'Mensaje:',
    mensaje,
  ].join('\n');

  await emisor.sendMail({
    from: `"Web ArigaTours" <${process.env.SMTP_USUARIO}>`,
    to: destino,
    replyTo: correo,
    subject: `[Web] Consulta de ${nombre}`,
    text: cuerpoTexto,
    html: cuerpoHtml,
  });

  return true;
}
