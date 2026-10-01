/**
 * Puente entre React y la etiqueta de Google Ads que vive en index.html.
 *
 * gtag y reportWhatsAppClick se definen alli, en el <head>, porque Google
 * pide que la etiqueta este antes que cualquier otra cosa. Desde los
 * componentes se llega a ellas a traves de estas funciones, que no fallan
 * si un bloqueador de anuncios las ha quitado de en medio.
 */

/** Clave de localStorage con la eleccion de cookies. index.html lee la misma. */
export const CLAVE_COOKIES = 'arigatours_cookies';

/**
 * Cuenta una conversion de Google Ads. Va en el onClick de cada enlace que
 * abre WhatsApp; no frena el enlace, que se abre igual que siempre.
 */
export function reportarClicWhatsapp() {
  try {
    if (typeof window.reportWhatsAppClick === 'function') window.reportWhatsAppClick();
  } catch {
    // Si la etiqueta no esta, el WhatsApp tiene que abrirse de todos modos.
  }
}

/** 'aceptadas', 'rechazadas' o null si el visitante aun no ha elegido. */
export function leerEleccionCookies() {
  try {
    const valor = localStorage.getItem(CLAVE_COOKIES);
    return valor === 'aceptadas' || valor === 'rechazadas' ? valor : null;
  } catch {
    return null;
  }
}

/** Guarda la eleccion y se la pasa a Google (Consent Mode v2). */
export function guardarEleccionCookies(acepta) {
  const eleccion = acepta ? 'aceptadas' : 'rechazadas';
  try {
    localStorage.setItem(CLAVE_COOKIES, eleccion);
  } catch {
    // Sin localStorage el banner volvera a salir en la proxima visita.
  }

  const valor = acepta ? 'granted' : 'denied';
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      ad_storage: valor,
      ad_user_data: valor,
      ad_personalization: valor,
      analytics_storage: valor,
    });
  }
}

/** Evento con el que el enlace "Cookies" del pie vuelve a abrir el banner. */
export const EVENTO_ABRIR_COOKIES = 'arigatours:abrir-cookies';
