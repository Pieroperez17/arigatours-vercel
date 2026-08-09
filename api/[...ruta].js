/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Punto de entrada de la API en Vercel
 *
 *  El nombre del archivo, "[...ruta].js", es lo que hace que Vercel mande
 *  aqui TODO lo que empiece por /api: /api/tours, /api/autenticacion/ingresar,
 *  etc. Con un "index.js" normal solo llegaria /api a secas.
 *
 *  Dentro no hay logica propia: se reutiliza la misma aplicacion Express del
 *  VPS (rutas, controladores y modelos sin tocar). La unica diferencia es que
 *  alli un proceso queda escuchando un puerto y aqui Vercel invoca la app una
 *  vez por peticion.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import aplicacion from '../backend/servidor.js';

export default aplicacion;

/*
 * Vercel, por su cuenta, leeria el cuerpo de la peticion y lo dejaria ya
 * convertido en req.body. Eso rompe la subida de imagenes: multer necesita
 * el flujo original sin consumir para poder leer el multipart. Con
 * bodyParser en false el flujo llega intacto y de parsearlo se encargan
 * express.json() y multer, igual que en el VPS.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
