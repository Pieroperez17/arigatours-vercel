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
  /*
   * Dos versiones del logo, y cada una tiene su sitio:
   *
   *   logo  → el horizontal, con el gato y la palabra "ArigaTours". Va en la
   *           barra de navegacion, donde hay ancho de sobra y conviene que
   *           se lea el nombre.
   *   logo2 → solo el gato. Se usa donde el espacio es cuadrado, como la
   *           pantalla de ingreso al panel, donde el horizontal quedaria
   *           diminuto para caber a lo ancho.
   *
   * El horizontal es SVG: al ser trazos y no pixeles, se ve nitido en
   * cualquier pantalla y pesa menos que una imagen equivalente.
   */
  logo: '/recursos/logo-rojo.svg',
  logo2: '/recursos/logo-neko.webp',
  // El mismo logo en blanco, para el pie, que va sobre rojo oscuro.
  logoBlanco: '/recursos/logo-blanco.svg',

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
    instagram: 'https://instagram.com/arigatourss',
    tiktok: 'https://tiktok.com/',
  },

  // Fichas publicas donde viven las resenas que se citan en el inicio.
  resenas: {
    tripadvisor: 'https://www.tripadvisor.com.mx/Attraction_Review-g1066456-d34390212-Reviews-Arigatours-Shibuya_Tokyo_Tokyo_Prefecture_Kanto.html',
    guruwalk: 'https://www.guruwalk.com/walks/67160-kobe-everything-you-need-to-know-more-than-just-beef',
    notaTripadvisor: 5,
    totalTripadvisor: 18,
  },

  anioFundacion: 2026,
};

/**
 * Fotos del arco de la portada: viajeros reales con sus guias.
 *
 * Van fijas y no salen del panel porque cada una lleva su ciudad y su lugar
 * escritos debajo, y las portadas del panel son solo imagenes sin texto. El
 * nombre de la ciudad va por idioma; el del lugar es nombre propio y se deja
 * igual en los tres.
 */
export const FOTOS_ARCO = [
  {
    foto: 'quienes-grupo-torii.webp',
    ciudad: { es: 'Kioto', en: 'Kyoto', ja: '京都' },
    lugar: 'Fushimi Inari',
    alt: 'Grupo de ArigaTours bajo el gran torii de Fushimi Inari, Kioto',
  },
  {
    foto: 'quienes-grupo-sannomiya.webp',
    ciudad: { es: 'Kobe', en: 'Kobe', ja: '神戸' },
    lugar: 'Sankita Street',
    alt: 'Viajeros con su guia de ArigaTours en Sankita Street, Kobe',
  },
  {
    foto: 'quienes-grupo-nara.webp',
    ciudad: { es: 'Nara', en: 'Nara', ja: '奈良' },
    lugar: 'Todai-ji',
    alt: 'Viajeros con su guia de ArigaTours frente al templo Todai-ji, Nara',
  },
];

/**
 * Kanji de cada ciudad, por su clave de la base. Es adorno: acompana al
 * nombre en las cabeceras de grupo y en las fotos sin imagen.
 */
export const KANJI_CIUDAD = {
  tokio: '東京',
  kioto: '京都',
  osaka: '大阪',
  nara: '奈良',
  kobe: '神戸',
  himeji: '姫路',
  kamakura: '鎌倉',
};

/** Enlace a WhatsApp con el mensaje ya escrito. */
export function enlaceWhatsapp(mensaje) {
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
  return `https://wa.me/${SITIO.whatsapp}${texto}`;
}

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
