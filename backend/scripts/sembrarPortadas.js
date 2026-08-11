/**
 * Siembra las fotos de portada que hasta ahora estaban fijas en el frontend.
 *
 * Uso:  npm run sembrar:portadas
 *
 * Va aparte de sembrarDatos.js por lo mismo que sembrarSocios: aquella
 * siembra los tours con "si existe, actualizar", asi que en un servidor en uso
 * reescribe con los datos de ejemplo cualquier tour editado desde el panel.
 *
 * Este script solo toca la tabla portadas y no pisa lo que ya exista: si la
 * imagen esta en la lista la deja como este, activa o desactivada. Se puede
 * repetir sin consecuencias.
 */

import 'dotenv/config';
import { pool } from '../configuracion/baseDatos.js';
import * as Portada from '../modelos/modeloPortada.js';

/*
 * Las mismas nueve que estaban en FOTOS_PORTADA, con la ruta publica entera.
 * Son archivos estaticos del repo (frontend/public/recursos), asi que se
 * sirven en cada despliegue y borrarlas de esta lista no borra el archivo.
 */
const PORTADAS = [
  '/recursos/Kioto_1.webp',
  '/recursos/Tokioundia.webp',
  '/recursos/osaka.webp',
  '/recursos/Kamakura8.webp',
  '/recursos/kobe3.webp',
  '/recursos/NARA2.webp',
  '/recursos/HIJI3.webp',
  '/recursos/kYOTO4.webp',
  '/recursos/Tokiovicerojo6.webp',
];

async function sembrar() {
  let creadas = 0;

  for (const imagen of PORTADAS) {
    if (await Portada.existe(imagen)) {
      console.log(`[portadas] ${imagen}: ya esta, se deja como esta`);
      continue;
    }

    await Portada.crear(imagen);
    console.log(`[portadas] ${imagen}: anadida`);
    creadas++;
  }

  console.log(`[portadas] Terminado. Nuevas: ${creadas} de ${PORTADAS.length}.`);
}

sembrar()
  .then(() => pool.end())
  .catch((error) => {
    console.error('[portadas] Fallo:', error.message);
    pool.end();
    process.exit(1);
  });
