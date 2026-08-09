/**
 * Fondo decorativo de la tarjeta de contacto de un socio.
 *
 * Dibuja en muy suave un torii y una pagoda al fondo, y una rama de cerezo
 * cayendo desde la esquina superior derecha.
 *
 * Va como SVG dibujado aqui y no como imagen porque asi hereda los colores
 * de la marca (toma --rosa-claro y --rosa-sakura del CSS), escala sin
 * pixelarse en cualquier pantalla y no anade ninguna descarga: la tarjeta
 * se ve completa desde el primer instante, que importa cuando se abre desde
 * el movil en la calle y con mala cobertura.
 *
 * aria-hidden porque no aporta nada a quien usa un lector de pantalla: es
 * adorno, y anunciarlo solo estorbaria antes de llegar a los botones.
 */
export default function FondoSakura() {
  return (
    <svg
      className="socio-fondo"
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* ── Siluetas de fondo: pagoda a la izquierda, torii a la derecha ── */}
      <g className="socio-fondo-siluetas">
        {/* Pagoda de tres cuerpos */}
        <g transform="translate(58 150)">
          <path d="M-34 0 H34 L26 10 H-26 Z" />
          <rect x="-15" y="10" width="30" height="26" />
          <path d="M-29 36 H29 L22 46 H-22 Z" />
          <rect x="-12" y="46" width="24" height="24" />
          <path d="M-24 70 H24 L18 80 H-18 Z" />
          <rect x="-10" y="80" width="20" height="30" />
          <rect x="-14" y="110" width="28" height="6" />
          {/* Aguja del remate */}
          <rect x="-1.5" y="-16" width="3" height="16" />
        </g>

        {/* Torii */}
        <g transform="translate(300 190)">
          {/* Dintel superior, con la curva hacia arriba tipica */}
          <path d="M-62 0 q62 -12 124 0 l0 9 q-62 -12 -124 0 Z" />
          <rect x="-52" y="22" width="104" height="8" />
          {/* Pilares, ligeramente inclinados hacia dentro */}
          <path d="M-44 9 h11 l6 105 h-13 Z" />
          <path d="M44 9 h-11 l-6 105 h13 Z" />
        </g>
      </g>

      {/* ── Rama de cerezo, desde la esquina superior derecha ── */}
      <g className="socio-fondo-rama">
        <path
          className="socio-fondo-tallo"
          d="M400 18 C352 30 318 52 292 84 M330 44 C316 60 308 78 304 96 M292 84 C272 96 250 104 226 108"
        />

        {/* Cada flor son cinco petalos girados 72 grados */}
        {[
          [356, 34, 1],
          [318, 58, 0.85],
          [300, 96, 0.75],
          [286, 74, 0.7],
          [252, 100, 0.8],
          [228, 110, 0.62],
          [338, 22, 0.68],
        ].map(([x, y, escala], indice) => (
          <g key={indice} transform={`translate(${x} ${y}) scale(${escala})`}>
            {[0, 72, 144, 216, 288].map((giro) => (
              <ellipse
                key={giro}
                className="socio-fondo-petalo"
                cx="0"
                cy="-7"
                rx="4.6"
                ry="7"
                transform={`rotate(${giro})`}
              />
            ))}
            <circle className="socio-fondo-centro" r="2.1" />
          </g>
        ))}
      </g>
    </svg>
  );
}
