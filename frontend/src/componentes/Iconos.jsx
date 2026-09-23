/**
 * Iconos de linea fina del diseño.
 *
 * Van dibujados aqui y no con Font Awesome porque el trazo de 1.5 px es parte
 * del estilo: los de Font Awesome son macizos y en esta tipografia tan
 * ligera se veian como manchas. Todos heredan el color del texto que los
 * rodea (currentColor) y son decorativos: el texto de al lado ya dice que
 * son, asi que no se anuncian.
 */

function Icono({ tamano = 20, relleno = 'none', grosor = 1.5, children }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill={relleno}
      stroke={relleno === 'none' ? 'currentColor' : 'none'}
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconoChat = (p) => <Icono {...p}><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z" /></Icono>;
export const IconoReloj = (p) => <Icono {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icono>;
export const IconoCheck = (p) => <Icono grosor={1.8} {...p}><path d="M5 12l5 5 9-10" /></Icono>;
export const IconoCruz = (p) => <Icono {...p}><path d="M6 6l12 12M18 6L6 18" /></Icono>;
export const IconoCorreo = (p) => <Icono {...p}><rect x="3" y="5" width="18" height="14" /><path d="M3 6l9 7 9-7" /></Icono>;
export const IconoTelefono = (p) => (
  <Icono {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Icono>
);
export const IconoEnviar = (p) => <Icono {...p}><path d="M3 11l18-8-8 18-2-8z" /></Icono>;
export const IconoMenu = (p) => <Icono grosor={1.4} {...p}><path d="M4 8h16M4 16h16" /></Icono>;
export const IconoUsuario = (p) => <Icono {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icono>;
export const IconoPunto = (p) => <Icono {...p}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></Icono>;
export const IconoIdioma = (p) => <Icono {...p}><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></Icono>;
export const IconoGrupo = (p) => (
  <Icono {...p}><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M12 14.5A6 6 0 0 1 22 20" /></Icono>
);
export const IconoMapa = (p) => <Icono {...p}><path d="M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z" /><path d="M9 4v14M15 6v14" /></Icono>;
export const IconoBrujula = (p) => <Icono {...p}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></Icono>;
export const IconoFlecha = (p) => <Icono {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icono>;
export const IconoAnterior = (p) => <Icono {...p}><path d="M15 5l-7 7 7 7" /></Icono>;
export const IconoSiguiente = (p) => <Icono {...p}><path d="M9 5l7 7-7 7" /></Icono>;

export const IconoEstrella = ({ tamano = 16 }) => (
  <Icono tamano={tamano} relleno="currentColor">
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </Icono>
);

export const IconoFacebook = (p) => <Icono {...p}><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" /></Icono>;
export const IconoInstagram = (p) => <Icono {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></Icono>;
export const IconoTiktok = (p) => <Icono {...p}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 5" /></Icono>;

/** Cinco estrellas con el dato real en el aria-label. */
export function Estrellas({ cantidad = 5, tamano = 15 }) {
  return (
    <span className="estrellas" role="img" aria-label={`${cantidad} / 5`}>
      {Array.from({ length: cantidad }, (_, indice) => <IconoEstrella key={indice} tamano={tamano} />)}
    </span>
  );
}
