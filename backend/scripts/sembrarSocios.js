/**
 * Siembra SOLO las paginas de contacto de los socios.
 *
 * Uso:  npm run sembrar:socios
 *
 * Existe aparte de sembrarDatos.js por una razon concreta: aquella siembra
 * los tours con "si existe, actualizar", asi que reescribe con los datos de
 * ejemplo cualquier tour que se haya editado desde el panel. En un servidor
 * ya en uso eso es destructivo, y no se puede pedir que lo corran solo para
 * dar de alta a un socio.
 *
 * Este script no toca nada mas y no pisa lo que ya existe: si el socio esta
 * creado lo deja como este, con su foto y su mensaje. Se puede repetir las
 * veces que haga falta.
 */

import 'dotenv/config';
import { pool } from '../configuracion/baseDatos.js';
import * as Socio from '../modelos/modeloSocio.js';

const SOCIOS = [
  {
    id: 'daniela',
    nombre: 'Daniela Harada',
    cargo: 'Co-founder & Director · Kansai Region',
    whatsapp: '+81 70-9097-5476',
    instagram: 'haradadaniela',
    orden: 1,
  },
  {
    id: 'calvin',
    nombre: 'Calvin Lam',
    cargo: 'Co-founder & Director · Kansai Region',
    whatsapp: '+81 70-6438-2066',
    instagram: 'calvinpsss',
    orden: 2,
  },
  {
    id: 'jose',
    nombre: 'José Harada',
    cargo: 'Co-founder & Director',
    whatsapp: '+81 80-8808-7190',
    instagram: 'joseharada',
    orden: 3,
  },
  {
    id: 'roman',
    nombre: 'Roman Leon',
    cargo: 'Co-founder & Director · Kanto Region',
    whatsapp: '+34 666 08 77 29',
    instagram: 'roman_web.dev',
    orden: 4,
  },
];

async function sembrar() {
  let creados = 0;

  for (const socio of SOCIOS) {
    if (await Socio.existe(socio.id)) {
      console.log(`[socios] ${socio.id}: ya existe, se deja como esta`);
      continue;
    }

    const nombreCorto = socio.nombre.split(' ')[0];

    await Socio.crear({
      ...socio,
      foto: '',
      correo: 'arigatoursceo@gmail.com',
      activo: true,
      mensajeWhatsapp:
        `Hola ${nombreCorto}, escaneé tu tarjeta de ArigaTours y me gustaría ` +
        'recibir información sobre sus tours en Japón.',
    });

    console.log(`[socios] ${socio.id}: creado`);
    creados++;
  }

  console.log(`[socios] Terminado. Nuevos: ${creados} de ${SOCIOS.length}.`);
}

sembrar()
  .then(() => pool.end())
  .catch((error) => {
    console.error('[socios] Fallo:', error.message);
    pool.end();
    process.exit(1);
  });
