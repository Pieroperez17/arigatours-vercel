/**
 * Titulo que entra linea a linea desde detras de una mascara.
 *
 * Cada tramo del texto (lo normal y lo marcado entre asteriscos) va en su
 * propia linea, dentro de un marco con overflow oculto: el texto sube desde
 * abajo y aparece como si saliera de una ranura. El retraso de cada linea
 * lo pone el CSS a partir de --linea.
 *
 * "Explora Japón *a tu manera*" → [Explora Japón] [a tu manera]
 * "*自分流に*日本を探索"         → [自分流に] [日本を探索]
 */
export default function TituloPorLineas({ texto }) {
  if (!texto) return null;

  const lineas = texto
    .split('*')
    .map((trozo, indice) => ({ trozo: trozo.trim(), enfasis: indice % 2 === 1 }))
    .filter((linea) => linea.trozo);

  return lineas.map((linea, indice) => (
    <span key={indice} className="linea" style={{ '--linea': indice }}>
      {linea.enfasis ? <em>{linea.trozo}</em> : <span>{linea.trozo}</span>}
    </span>
  ));
}
