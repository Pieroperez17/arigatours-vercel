/**
 * Datos de la agencia en un solo lugar.
 *
 * Si cambia el telefono, el correo o las redes sociales, se edita aqui
 * y se actualiza en toda la web. No hay que buscar por los componentes.
 */

export const SITIO = {
  nombre: 'ArigaTours',
  lema: 'Descubre el auténtico Japón',
  /*
   * El maneki-neko sobre el circulo rojo. Es un WebP de 512 px generado a
   * partir de NewLogo.png, que se queda en la carpeta como original.
   *
   * Al PNG se le recorto el margen antes de convertirlo: dos tercios de la
   * imagen eran transparencia, y eso hacia que el gato se viera diminuto
   * dentro de su hueco en la barra de navegacion.
   *
   * Lleva fondo transparente, asi que sirve igual sobre el rosa de la barra
   * que sobre el blanco de la pantalla de ingreso. Por eso ahora los dos
   * campos apuntan al mismo archivo.
   */
  logo: '/recursos/logo-neko.webp',
  logo2: '/recursos/logo-neko.webp',

  correo: 'contacto@arigatours.com',

  /*
   * Se escribe "+81 70-..." y no "+81 070-...", que es como se marca dentro
   * de Japon: al anteponer el prefijo del pais, el cero inicial del movil se
   * cae. Dejandolo, wa.me recibiria 8107090975476 y no abriria ningun chat.
   */
  telefono: '+81 70-9097-5476',

  // Numero de WhatsApp en formato internacional, solo digitos.
  whatsapp: '817090975476',

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
