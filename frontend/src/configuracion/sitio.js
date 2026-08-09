/**
 * Datos de la agencia en un solo lugar.
 *
 * Si cambia el telefono, el correo o las redes sociales, se edita aqui
 * y se actualiza en toda la web. No hay que buscar por los componentes.
 */

export const SITIO = {
  nombre: 'ArigaTours',
  lema: 'Descubre el auténtico Japón',
  // Ojo con el nombre: el archivo es "ArigatoursLOGOv1" (sin guion bajo y con
  // la t minuscula). Es la version con fondo transparente, la que encaja sobre
  // el rosa de la barra. La alternativa con fondo solido es
  // "ArigaTours_LOGOCONFONDO.webp".
  logo: '/recursos/ArigaTours_LOGOCONFONDO.webp',
  logo2: '/recursos/ArigatoursLOGOv1.webp',

  correo: 'contacto@arigatours.com',
  telefono: '+81 70-6438-2066',

  // Numero de WhatsApp en formato internacional, solo digitos.
  whatsapp: '817064382066',

  redes: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    tiktok: 'https://tiktok.com/',
  },

  anioFundacion: 2026,
};

/**
 * Fotos que rotan de fondo en el carrusel de inicio y en las cabeceras.
 *
 * Todas las imagenes de /public/recursos estan en WebP y redimensionadas a
 * 1920 px de ancho como maximo: las originales eran fotos de camara de hasta
 * 8160 px, que el navegador descargaba enteras sin llegar a mostrarlas.
 */
export const FOTOS_PORTADA = [
  'Kioto_1.webp',
  'Tokioundia.webp',
  'osaka.webp',
  'Kamakura8.webp',
  'kobe3.webp',
  'NARA2.webp',
  'HIJI3.webp',
  'kYOTO4.webp',
  'Tokiovicerojo6.webp',
];

/** Devuelve la ruta publica de una imagen de la carpeta /public/recursos. */
export function recurso(nombreArchivo) {
  return `/recursos/${nombreArchivo}`;
}
