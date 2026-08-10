/**
 * Cliente HTTP unico para hablar con el backend.
 *
 * Todas las llamadas usan rutas relativas ("/api/..."), nunca una direccion
 * completa. En desarrollo Vite las reenvia al puerto 4020 y en el VPS lo hace
 * Nginx, asi que el mismo build funciona en los dos sitios sin recompilar.
 */

const CLAVE_TOKEN = 'arigatours_token';

// ── Manejo del token en el navegador ───────────────────────────────────────

export function guardarToken(token) {
  if (typeof token === 'string' && token.trim() !== '') {
    localStorage.setItem(CLAVE_TOKEN, token.trim());
  }
}

export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function borrarToken() {
  localStorage.removeItem(CLAVE_TOKEN);
}

/** Revisa la fecha de expiracion del token sin llamar al servidor. */
export function tokenExpirado(token) {
  try {
    const carga = JSON.parse(atob(token.split('.')[1]));
    if (!carga.exp) return false;
    return carga.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// ── Peticiones ─────────────────────────────────────────────────────────────

/**
 * Envuelve fetch para: agregar el token, convertir la respuesta a JSON y
 * lanzar un Error con el mensaje que manda el backend cuando algo falla.
 */
async function peticion(ruta, opciones = {}) {
  const cabeceras = { ...(opciones.headers || {}) };

  // Con FormData no se pone Content-Type: el navegador agrega el "boundary".
  if (opciones.body && !(opciones.body instanceof FormData)) {
    cabeceras['Content-Type'] = 'application/json';
  }

  const token = obtenerToken();
  if (token) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`/api${ruta}`, { ...opciones, headers: cabeceras });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (respuesta.status === 401) {
    borrarToken();
    throw new Error(datos?.error || 'Sesión expirada. Inicia sesión de nuevo.');
  }

  if (!respuesta.ok) {
    throw new Error(datos?.error || `Error ${respuesta.status}`);
  }

  return datos;
}

/** Arma una cadena de consulta a partir de un objeto, ignorando los vacios. */
function armarConsulta(parametros = {}) {
  const limpios = Object.entries(parametros).filter(
    ([, valor]) => valor !== undefined && valor !== null && valor !== ''
  );
  if (limpios.length === 0) return '';
  return `?${new URLSearchParams(limpios).toString()}`;
}

// ── Tours ──────────────────────────────────────────────────────────────────

export const apiTours = {
  listar: ({ idioma, tipo, ciudad } = {}) =>
    peticion(`/tours${armarConsulta({ idioma, tipo, ciudad })}`),

  obtener: (id, idioma) => peticion(`/tours/${id}${armarConsulta({ idioma })}`),

  listarCiudades: (idioma) => peticion(`/tours/ciudades${armarConsulta({ idioma })}`),

  listarTodosAdmin: (idioma) => peticion(`/tours/admin/todos${armarConsulta({ idioma })}`),

  obtenerParaEdicion: (id) => peticion(`/tours/${id}/edicion`),

  crear: (formulario) => peticion('/tours', { method: 'POST', body: formulario }),

  actualizar: (id, formulario) => peticion(`/tours/${id}`, { method: 'PUT', body: formulario }),

  eliminar: (id) => peticion(`/tours/${id}`, { method: 'DELETE' }),
};

// ── Blogs ──────────────────────────────────────────────────────────────────

export const apiBlogs = {
  listar: ({ idioma, categoria } = {}) => peticion(`/blogs${armarConsulta({ idioma, categoria })}`),

  listarCategorias: (idioma) => peticion(`/blogs/categorias${armarConsulta({ idioma })}`),

  listarTodosAdmin: () => peticion('/blogs/admin/todos'),

  crear: (formulario) => peticion('/blogs', { method: 'POST', body: formulario }),

  actualizar: (id, formulario) => peticion(`/blogs/${id}`, { method: 'PUT', body: formulario }),

  eliminar: (id) => peticion(`/blogs/${id}`, { method: 'DELETE' }),
};

// ── Socios (paginas de contacto individuales) ──────────────────────────────

export const apiSocios = {
  listar: () => peticion('/socios'),

  obtener: (id) => peticion(`/socios/${id}`),

  listarTodosAdmin: () => peticion('/socios/admin/todos'),

  crear: (formulario) => peticion('/socios', { method: 'POST', body: formulario }),

  actualizar: (id, formulario) => peticion(`/socios/${id}`, { method: 'PUT', body: formulario }),

  eliminar: (id) => peticion(`/socios/${id}`, { method: 'DELETE' }),
};

// ── Autenticacion ──────────────────────────────────────────────────────────

export const apiAutenticacion = {
  ingresar: (correo, clave) =>
    peticion('/autenticacion/ingresar', {
      method: 'POST',
      body: JSON.stringify({ correo, clave }),
    }),

  perfil: () => peticion('/autenticacion/perfil'),

  cambiarClave: (claveActual, claveNueva) =>
    peticion('/autenticacion/clave', {
      method: 'PATCH',
      body: JSON.stringify({ claveActual, claveNueva }),
    }),
};

// ── Contacto ───────────────────────────────────────────────────────────────

export const apiContacto = {
  enviar: (datos) => peticion('/contacto', { method: 'POST', body: JSON.stringify(datos) }),

  listarConsultas: () => peticion('/contacto/consultas'),

  cambiarEstado: (id, atendida) =>
    peticion(`/contacto/consultas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ atendida }),
    }),

  eliminarConsulta: (id) => peticion(`/contacto/consultas/${id}`, { method: 'DELETE' }),
};
