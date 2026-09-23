/**
 * Pinta un texto marcando en cursiva lo que va entre asteriscos:
 * "Explora Japón *a tu manera*" → Explora Japón <em>a tu manera</em>.
 *
 * Los titulos del diseño llevan una parte en cursiva, y cual es depende del
 * idioma: en japones no hay espacios para decidir "la ultima palabra", asi
 * que la marca viaja con el propio texto en el diccionario de traducciones.
 */
export default function ConEnfasis({ texto }) {
  if (!texto) return null;

  return texto.split('*').map((trozo, indice) =>
    indice % 2 === 1 ? <em key={indice}>{trozo}</em> : trozo
  );
}

/** El mismo texto sin las marcas, para atributos como title o aria-label. */
export function sinMarcas(texto) {
  return (texto || '').replaceAll('*', '');
}
