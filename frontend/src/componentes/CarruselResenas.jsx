/**
 * Carrusel infinito de reseñas.
 *
 * La lista se pinta dos veces seguidas y la pista se desplaza justo la mitad
 * de su ancho: al terminar, el segundo bloque queda exactamente donde estaba
 * el primero, asi que el salto al reiniciar la animacion no se ve y el bucle
 * parece no tener fin. Se pausa al pasar el raton para poder leer con calma.
 */

export default function CarruselResenas({ titulo, entradilla, resenas }) {
  if (resenas.length === 0) return null;

  return (
    <section className="seccion-resenas">
      <div className="encabezado-seccion">
        {entradilla && <span className="carrusel-entradilla">{entradilla}</span>}
        <h2>{titulo}</h2>
      </div>

      <div className="cinta-resenas">
        <div
          className="cinta-resenas-pista"
          style={{ '--total-resenas': resenas.length }}
        >
          {[...resenas, ...resenas].map((resena, indice) => (
            <figure
              key={`${resena.id}-${indice}`}
              className="resena"
              aria-hidden={indice >= resenas.length}
            >
              {/* Las estrellas son decoracion: el dato real va en el aria-label */}
              <div className="resena-estrellas" aria-label={`${resena.estrellas} de 5`}>
                <span aria-hidden="true">{'★'.repeat(resena.estrellas)}</span>
              </div>

              <blockquote>{resena.texto}</blockquote>

              <figcaption>
                <strong>{resena.autor}</strong>
                <span>{resena.lugar}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
