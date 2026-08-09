/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Punto de entrada de la API en Vercel
 *
 *  Toda peticion a /api/... la reescribe vercel.json hacia este unico
 *  archivo, que se limita a entregarsela a la misma aplicacion Express que
 *  corre en el VPS. Aqui no hay logica propia: rutas, controladores y
 *  modelos se reutilizan sin tocar.
 *
 *  La diferencia con un servidor normal es que alli un proceso queda
 *  escuchando un puerto, y aqui la plataforma invoca la app una vez por
 *  peticion.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import aplicacion from '../backend/servidor.js';

export default function manejador(peticion, respuesta) {
  // Deja a la vista que ruta recibio Express de verdad. Es barato y ahorra
  // adivinar si un 404 lo devolvio Vercel antes de llegar aqui o Express
  // porque la ruta no existe.
  respuesta.setHeader('x-ruta-recibida', peticion.url || '(vacia)');
  return aplicacion(peticion, respuesta);
}

/*
 * Vercel, por su cuenta, leeria el cuerpo de la peticion y lo dejaria ya
 * convertido en objeto. Eso rompe la subida de imagenes: multer necesita el
 * flujo original sin consumir para poder leer el multipart. Con bodyParser
 * en false el flujo llega intacto y de parsearlo se encargan express.json()
 * y multer, igual que en el VPS.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
