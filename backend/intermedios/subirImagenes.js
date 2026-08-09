/**
 * Subida de imagenes a Vercel Blob.
 *
 * En el VPS los archivos van a la carpeta "subidas/", que es un volumen de
 * Docker y por eso sobrevive a los despliegues. Aqui no hay disco que dure:
 * cada invocacion de la funcion arranca con un sistema de archivos limpio y
 * lo que se escriba se pierde. Por eso los archivos van a Vercel Blob, un
 * almacenamiento aparte que si persiste.
 *
 * El proceso tiene dos pasos porque multer no sabe hablar con Blob:
 *   1. multer recibe el multipart y deja cada archivo en memoria (Buffer).
 *   2. guardarEnBlob sube esos buffers y anota la URL publica resultante.
 */

import multer from 'multer';
import path from 'path';
import { put } from '@vercel/blob';

// Carpeta virtual dentro del store, solo para no mezclar estas imagenes con
// cualquier otra cosa que se suba al mismo Blob en el futuro.
const CARPETA_BLOB = 'subidas';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

function filtrarArchivo(_req, archivo, continuar) {
  if (TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
    continuar(null, true);
    return;
  }

  // Se marca con estado 400 para que el manejador de errores responda
  // "peticion incorrecta" con este mensaje, y no un 500 generico.
  const error = new Error('Solo se permiten imagenes (jpg, png, webp, avif o gif).');
  error.estado = 400;
  continuar(error);
}

/*
 * memoryStorage y no diskStorage: el archivo queda como Buffer en
 * archivo.buffer, listo para reenviarlo a Blob sin tocar el disco.
 *
 * El limite de 8 MB por archivo tambien protege la memoria de la funcion,
 * que es un recurso mas ajustado que el disco del VPS.
 */
const subidor = multer({
  storage: multer.memoryStorage(),
  fileFilter: filtrarArchivo,
  limits: { fileSize: 8 * 1024 * 1024 },
});

/** Nombre unico para el archivo, conservando algo del original por claridad. */
function nombrarArchivo(nombreOriginal) {
  const extension = path.extname(nombreOriginal).toLowerCase();
  const base = path
    .basename(nombreOriginal, extension)
    .replace(/[^a-z0-9_-]/gi, '-')
    .toLowerCase()
    .slice(0, 50);
  return `${CARPETA_BLOB}/${base}-${Date.now()}-${Math.round(Math.random() * 1e4)}${extension}`;
}

/** Sube un archivo de multer a Blob y le cuelga la URL publica resultante. */
async function subirUno(archivo) {
  const resultado = await put(nombrarArchivo(archivo.originalname), archivo.buffer, {
    access: 'public',
    contentType: archivo.mimetype,
    // El nombre ya lleva marca de tiempo y azar, asi que no hace falta que
    // Blob le anada su propio sufijo: con esto la URL queda predecible.
    addRandomSuffix: false,
  });

  archivo.url = resultado.url;
  return archivo;
}

/*
 * Middleware que corre despues de multer. Recoge lo que haya dejado, sea un
 * archivo suelto (req.file) o varios campos (req.files), y los sube en
 * paralelo: con una galeria de 20 fotos, hacerlo en serie multiplicaria por
 * 20 el tiempo de la peticion.
 */
export async function guardarEnBlob(req, _res, siguiente) {
  try {
    const pendientes = [];

    if (req.file) pendientes.push(req.file);
    if (req.files) {
      // multer.fields() entrega un objeto {campo: [archivos]}; array() una lista.
      const grupos = Array.isArray(req.files) ? [req.files] : Object.values(req.files);
      for (const grupo of grupos) pendientes.push(...grupo);
    }

    if (pendientes.length > 0 && !process.env.BLOB_READ_WRITE_TOKEN) {
      const error = new Error(
        'Falta BLOB_READ_WRITE_TOKEN: conecta un store de Vercel Blob al proyecto.',
      );
      error.estado = 500;
      throw error;
    }

    await Promise.all(pendientes.map(subirUno));
    siguiente();
  } catch (error) {
    siguiente(error);
  }
}

/** Para el formulario de tour: una portada + hasta 20 fotos de galeria. */
export const subirImagenesTour = [
  subidor.fields([
    { name: 'archivoImagen', maxCount: 1 },
    { name: 'archivosGaleria', maxCount: 20 },
  ]),
  guardarEnBlob,
];

/** Para el formulario de blog: una sola imagen. */
export const subirImagenBlog = [subidor.single('archivoImagen'), guardarEnBlob];

/**
 * Direccion publica de un archivo ya subido.
 *
 * Recibe el archivo de multer, no un nombre suelto: la URL la decide Blob al
 * subirlo y no se puede reconstruir a partir del nombre.
 */
export function rutaPublica(archivo) {
  return archivo?.url ?? '';
}
