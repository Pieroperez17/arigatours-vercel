/**
 * Siembra la base de datos con los datos iniciales.
 *
 * Uso:  npm run sembrar
 *
 * Hace tres cosas:
 *   1. Crea (o actualiza) el usuario administrador con la clave del .env
 *   2. Carga los tours desde scripts/datos/tours_es|en|ja.json
 *   3. Carga los articulos desde scripts/datos/blogs_es.json
 *
 * Es seguro repetirlo: usa "insertar o actualizar", nunca duplica registros.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { pool } from '../configuracion/baseDatos.js';
import * as Usuario from '../modelos/modeloUsuario.js';
import * as Tour from '../modelos/modeloTour.js';
import * as Blog from '../modelos/modeloBlog.js';
import * as Socio from '../modelos/modeloSocio.js';
import { generarClave, esPrecioGratuito, normalizarLista } from '../utilidades/ayudas.js';

const carpetaActual = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_DATOS = path.join(carpetaActual, 'datos');

/**
 * Nombres de ciudad en cada idioma.
 *
 * Los JSON de origen traen huecos: "Tokio" aparece sin traducir en ingles y
 * japones, y "Nara"/"Himeji" solo estan traducidos en algunos tours. Sin este
 * diccionario, la web en japones mostraria unas ciudades en japones y otras
 * en espanol. Para agregar una ciudad nueva basta con anadir una linea.
 */
const NOMBRES_CIUDAD = {
  kamakura: { es: 'Kamakura', en: 'Kamakura', ja: '鎌倉' },
  tokio:    { es: 'Tokio',    en: 'Tokyo',    ja: '東京' },
  kioto:    { es: 'Kioto',    en: 'Kyoto',    ja: '京都' },
  osaka:    { es: 'Osaka',    en: 'Osaka',    ja: '大阪' },
  kobe:     { es: 'Kobe',     en: 'Kobe',     ja: '神戸' },
  himeji:   { es: 'Himeji',   en: 'Himeji',   ja: '姫路' },
  nara:     { es: 'Nara',     en: 'Nara',     ja: '奈良' },
};

/**
 * Tematicas en cada idioma, indexadas por la version en espanol.
 * Las tematicas que no esten aqui se dejan tal como vengan en el origen.
 */
const NOMBRES_TEMATICA = {
  'Tour Privado':      { es: 'Tour Privado',      en: 'Private Tour',      ja: 'プライベートツアー' },
  'Free Walking Tour': { es: 'Free Walking Tour', en: 'Free Walking Tour', ja: 'フリーウォーキングツアー' },
};

// Imagenes que el proyecto original referenciaba pero que nunca existieron en
// su carpeta de recursos; se sustituyen por fotos reales para que ninguna
// tarjeta quede con la imagen rota.
const IMAGENES_SUSTITUTAS = {
  'tokio-foto.jpg': 'Tokioundia.jpg',
  'kioto-foto.jpg': 'Kioto_1.jpg',
  'osaka-foto.jpg': 'osaka.jpg',
  'fondo-contacto.jpg': 'kYOTO2.jpg',
  'kobe.jpg': 'kobe1.jpg',            // solo existen kobe1..kobe4
};

/**
 * Convierte las rutas del proyecto original ("Recursos/Foo.jpg",
 * "../Recursos/Foo.jpg") a la ruta publica del frontend ("/recursos/Foo.webp").
 *
 * Todas las fotos de /public/recursos se convirtieron a WebP, asi que la
 * extension original del JSON (.jpg / .png) se cambia por .webp. Las
 * direcciones absolutas (http, /api/subidas) se dejan tal cual: las imagenes
 * que se suben desde el panel conservan su formato.
 */
function normalizarRutaImagen(ruta) {
  const texto = String(ruta || '').trim();
  if (texto === '') return '';
  if (texto.startsWith('http://') || texto.startsWith('https://')) return texto;
  if (texto.startsWith('/api/')) return texto;

  const nombreArchivo = texto.split('/').pop();
  const nombreFinal = IMAGENES_SUSTITUTAS[nombreArchivo] || nombreArchivo;
  const nombreWebp = nombreFinal.replace(/\.(jpe?g|png)$/i, '.webp');

  return `/recursos/${nombreWebp}`;
}

/** Lee un archivo JSON de scripts/datos. Devuelve [] si no existe. */
function leerDatos(nombreArchivo) {
  const ruta = path.join(CARPETA_DATOS, nombreArchivo);

  if (!existsSync(ruta)) {
    console.warn(`[siembra] Aviso: no se encontro ${nombreArchivo}, se omite.`);
    return [];
  }

  return JSON.parse(readFileSync(ruta, 'utf-8'));
}

// ── 1. Usuario administrador ───────────────────────────────────────────────
async function sembrarAdministrador() {
  const correo = (process.env.ADMIN_CORREO || 'admin@arigatours.com').trim().toLowerCase();
  const clave = process.env.ADMIN_CLAVE || 'Admin123!';

  const claveHash = await bcrypt.hash(clave, 12);
  const usuario = await Usuario.crearOActualizar({
    correo,
    claveHash,
    nombre: 'Administrador',
    rol: 'admin',
  });

  console.log(`[siembra] Usuario administrador listo: ${usuario.correo}`);

  if (clave === 'Admin123!') {
    console.warn('[siembra] ATENCION: estas usando la clave de ejemplo. Cambiala en el .env antes de publicar.');
  }
}

// ── 2. Tours con sus tres idiomas ──────────────────────────────────────────
async function sembrarTours() {
  const toursEspanol = leerDatos('tours_es.json');

  if (toursEspanol.length === 0) {
    console.warn('[siembra] No hay tours que cargar.');
    return;
  }

  // Los otros idiomas se indexan por id para buscarlos en O(1).
  const porIdioma = {
    en: indexarPorId(leerDatos('tours_en.json')),
    ja: indexarPorId(leerDatos('tours_ja.json')),
  };

  let contador = 0;

  for (const [posicion, tourEspanol] of toursEspanol.entries()) {
    const id = generarClave(tourEspanol.id);
    if (!id) continue;

    const galeria = normalizarLista(tourEspanol.galeria).map(normalizarRutaImagen);
    const imagen = normalizarRutaImagen(tourEspanol.imagen) || galeria[0] || '';

    const ciudadClave = generarClave(tourEspanol.ciudad);
    const tematicaEspanol = String(tourEspanol.tematica || '').trim();

    const datos = {
      id,
      ciudadClave,
      tipo: esPrecioGratuito(tourEspanol.precio) ? 'gratuito' : 'privado',
      imagen,
      galeria,
      duracion: String(tourEspanol.duracion || '').trim(),
      fechasDisponibles: normalizarLista(tourEspanol.fechasDisponibles),
      orden: posicion,
      activo: true,
      traducciones: {
        es: extraerTextos(tourEspanol, 'es', ciudadClave, tematicaEspanol),
      },
    };

    for (const idioma of ['en', 'ja']) {
      const traducido = porIdioma[idioma][tourEspanol.id];
      if (traducido) {
        datos.traducciones[idioma] = extraerTextos(traducido, idioma, ciudadClave, tematicaEspanol);
      }
    }

    if (await Tour.existe(id)) {
      await Tour.actualizar(id, datos);
    } else {
      await Tour.crear(datos);
    }

    contador += 1;
  }

  const idiomasCargados = Object.entries(porIdioma)
    .map(([idioma, mapa]) => `${idioma.toUpperCase()}: ${Object.keys(mapa).length}`)
    .join(' | ');

  console.log(`[siembra] Tours cargados: ${contador} (ES: ${toursEspanol.length} | ${idiomasCargados})`);
}

/**
 * Toma los campos de texto traducibles de un tour del JSON original y
 * completa la ciudad y la tematica con el diccionario cuando estan definidas
 * ahi, para que los tres idiomas queden coherentes.
 */
function extraerTextos(tour, idioma, ciudadClave, tematicaEspanol) {
  const ciudadDiccionario = NOMBRES_CIUDAD[ciudadClave]?.[idioma];
  const tematicaDiccionario = NOMBRES_TEMATICA[tematicaEspanol]?.[idioma];

  return {
    titulo: String(tour.titulo || '').trim(),
    ciudad: ciudadDiccionario || String(tour.ciudad || '').trim(),
    tematica: tematicaDiccionario || String(tour.tematica || '').trim(),
    precio: String(tour.precio || '').trim(),
    puntoEncuentro: String(tour.puntoEncuentro || '').trim(),
    descripcion: String(tour.descripcion || '').trim(),
    incluye: normalizarLista(tour.incluye),
    noIncluye: normalizarLista(tour.noIncluye),
  };
}

/** Convierte un arreglo de tours en un objeto { id: tour }. */
function indexarPorId(lista) {
  return Object.fromEntries((lista || []).map((elemento) => [elemento.id, elemento]));
}

// ── 3. Articulos del blog ──────────────────────────────────────────────────
async function sembrarBlogs() {
  const articulos = leerDatos('blogs_es.json');

  if (articulos.length === 0) {
    console.warn('[siembra] No hay articulos que cargar.');
    return;
  }

  for (const articulo of articulos) {
    const datos = {
      id: generarClave(articulo.id),
      idioma: 'es',
      categoria: String(articulo.categoria || '').trim(),
      titulo: String(articulo.titulo || '').trim(),
      autor: String(articulo.autor || '').trim(),
      fecha: String(articulo.fecha || '').trim(),
      imagen: normalizarRutaImagen(articulo.imagen),
      resumen: String(articulo.resumen || '').trim(),
      contenido: String(articulo.contenido || '').trim(),
      publicado: true,
    };

    if (await Blog.existe(datos.id)) {
      await Blog.actualizar(datos.id, datos);
    } else {
      await Blog.crear(datos);
    }
  }

  console.log(`[siembra] Articulos cargados: ${articulos.length}`);
}

/**
 * Paginas de contacto de los socios.
 *
 * El id es el ultimo tramo de la direccion que llevan impresa en el QR de su
 * tarjeta (/contacto/daniela), asi que conviene no cambiarlo una vez impresas:
 * las tarjetas ya repartidas dejarian de funcionar.
 */
const SOCIOS = [
  {
    id: 'daniela',
    nombre: 'Daniela Harada',
    cargo: 'Co-founder & Director · Kansai Region',
    whatsapp: '+81 70-9097-5476',
    instagram: 'haradadaniela',
    correo: 'arigatoursceo@gmail.com',
    orden: 1,
  },
  {
    id: 'calvin',
    nombre: 'Calvin Lam',
    cargo: 'Co-founder & Director · Kansai Region',
    whatsapp: '+81 70-6438-2066',
    instagram: 'calvinpsss',
    correo: 'arigatoursceo@gmail.com',
    orden: 2,
  },
  {
    id: 'jose',
    nombre: 'José Harada',
    cargo: 'Co-founder & Director',
    whatsapp: '+81 80-8808-7190',
    instagram: 'joseharada',
    correo: 'arigatoursceo@gmail.com',
    orden: 3,
  },
  {
    id: 'roman',
    nombre: 'Roman Leon',
    cargo: 'Co-founder & Director · Kanto Region',
    whatsapp: '+34 666 08 77 29',
    instagram: 'roman_web.dev',
    correo: 'arigatoursceo@gmail.com',
    orden: 4,
  },
];

async function sembrarSocios() {
  for (const socio of SOCIOS) {
    // Solo el nombre de pila: es como se presenta quien entrega la tarjeta.
    const nombreCorto = socio.nombre.split(' ')[0];

    const datos = {
      ...socio,
      foto: '',
      mensajeWhatsapp:
        `Hola ${nombreCorto}, escaneé tu tarjeta de ArigaTours y me gustaría ` +
        'recibir información sobre sus tours en Japón.',
      activo: true,
    };

    /*
     * Si el socio ya existe no se toca. La siembra se repite en cada
     * despliegue, y sobrescribir aqui borraria la foto que hayan subido o el
     * mensaje que hayan reescrito desde el panel.
     */
    if (!(await Socio.existe(datos.id))) {
      await Socio.crear(datos);
    }
  }

  console.log(`[siembra] Paginas de contacto listas: ${SOCIOS.length}`);
}

// ── Ejecucion ──────────────────────────────────────────────────────────────
async function sembrar() {
  console.log('[siembra] Comenzando...');
  await sembrarAdministrador();
  await sembrarTours();
  await sembrarBlogs();
  await sembrarSocios();
  console.log('[siembra] Terminado correctamente.');
}

sembrar()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('[siembra] Fallo:', error);
    await pool.end().catch(() => {});
    process.exit(1);
  });
