/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Punto de entrada de la API
 *
 *  Arquitectura MVC:
 *    rutas/         → definen las direcciones y a quien llaman
 *    controladores/ → validan la peticion y arman la respuesta
 *    modelos/       → unicos que hablan con PostgreSQL
 *    intermedios/   → autenticacion, subida de archivos, errores
 *    configuracion/ → conexion a la base de datos y al correo
 * ═══════════════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import { pathToFileURL } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { probarConexion, pool } from './configuracion/baseDatos.js';
import { rutaNoEncontrada, manejadorErrores } from './intermedios/manejadorErrores.js';

import rutasAutenticacion from './rutas/rutasAutenticacion.js';
import rutasTours from './rutas/rutasTours.js';
import rutasBlogs from './rutas/rutasBlogs.js';
import rutasContacto from './rutas/rutasContacto.js';

const aplicacion = express();
const PUERTO = Number(process.env.PUERTO) || 4020;

// ── Seguridad basica de cabeceras ──────────────────────────────────────────
// crossOriginResourcePolicy se relaja para que el frontend pueda mostrar
// las imagenes servidas desde /api/subidas cuando corre en otro puerto.
aplicacion.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Detras del proxy de Vercel: hace que req.ip sea la IP real del visitante,
// necesario para que los limitadores de peticiones funcionen bien. Sin esto
// todas las peticiones parecerian venir de la misma IP y el limitador
// bloquearia a unos usuarios por culpa de otros.
aplicacion.set('trust proxy', 1);

// ── CORS ───────────────────────────────────────────────────────────────────
// En produccion, con front y back bajo el mismo dominio, no hace falta.
// En desarrollo permite que Vite (otro puerto) consuma la API.
const origenesPermitidos = (process.env.ORIGENES_PERMITIDOS || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

aplicacion.use(cors({
  origin(origen, continuar) {
    // Peticiones sin origen (curl, apps moviles) o lista vacia: se permiten.
    if (!origen || origenesPermitidos.length === 0) return continuar(null, true);
    if (origenesPermitidos.includes(origen)) return continuar(null, true);
    continuar(new Error(`Origen no permitido por CORS: ${origen}`));
  },
  credentials: true,
}));

// ── Lectura del cuerpo de las peticiones ───────────────────────────────────
aplicacion.use(express.json({ limit: '2mb' }));
aplicacion.use(express.urlencoded({ extended: true, limit: '2mb' }));

/*
 * Aqui NO se sirven las imagenes subidas, a diferencia del despliegue del
 * VPS. Viven en Vercel Blob, que las publica en su propio dominio, y lo que
 * se guarda en la base de datos ya es esa URL completa. El navegador las
 * pide directamente y no pasan por esta funcion.
 */

// ── Comprobacion de salud ──────────────────────────────────────────────────
aplicacion.get('/api/salud', async (_peticion, respuesta) => {
  try {
    await pool.query('SELECT 1');
    respuesta.json({ estado: 'ok', baseDatos: 'conectada' });
  } catch {
    respuesta.status(503).json({ estado: 'degradado', baseDatos: 'sin conexion' });
  }
});

// ── Rutas de la API ────────────────────────────────────────────────────────
aplicacion.use('/api/autenticacion', rutasAutenticacion);
aplicacion.use('/api/tours', rutasTours);
aplicacion.use('/api/blogs', rutasBlogs);
aplicacion.use('/api/contacto', rutasContacto);

// ── Cierre: 404 y manejo de errores (siempre al final) ─────────────────────
aplicacion.use(rutaNoEncontrada);
aplicacion.use(manejadorErrores);

/*
 * La aplicacion se exporta armada pero SIN escuchar en ningun puerto.
 *
 * En Vercel no hay un proceso vivo esperando peticiones: api/index.js importa
 * esto y se lo entrega a la plataforma, que lo invoca una vez por peticion.
 * Llamar aqui a listen() romperia ese modelo.
 *
 * Para correrlo como servidor de verdad (en local, o en cualquier maquina
 * propia) esta iniciarServidor(), que solo se ejecuta si este archivo es el
 * que se lanzo directamente con "node servidor.js".
 */
export default aplicacion;

// ── Arranque como servidor tradicional ─────────────────────────────────────
export async function iniciarServidor() {
  try {
    await probarConexion();
  } catch (error) {
    // No se corta el arranque: si la BD tarda en levantar, la API responde
    // 503 en /api/salud y se recupera sola cuando la BD este lista.
    console.error('[servidor] Aviso: la base de datos aun no responde —', error.message);
  }

  aplicacion.listen(PUERTO, () => {
    console.log(`[servidor] API escuchando en http://localhost:${PUERTO}`);
    console.log(`[servidor] Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
  });

  // Cierre ordenado del pool cuando el sistema manda la senal de apagado.
  // Solo aplica teniendo proceso propio: en serverless no existe tal cosa.
  for (const senal of ['SIGTERM', 'SIGINT']) {
    process.on(senal, async () => {
      console.log(`[servidor] Recibida ${senal}, cerrando conexiones...`);
      await pool.end().catch(() => {});
      process.exit(0);
    });
  }
}

/*
 * Compara el archivo que Node arranco con el de este modulo: si coinciden,
 * se pidio "node servidor.js" y toca levantar el servidor. Cuando lo importa
 * la funcion serverless no coinciden, y no se levanta nada.
 */
const ejecutadoDirectamente =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (ejecutadoDirectamente) iniciarServidor();
