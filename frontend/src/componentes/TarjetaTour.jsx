/**
 * Tarjeta de un tour: la foto en vertical a sangre, con la ciudad y el
 * titulo encima. Al pasar el raton (o al enfocarla con el teclado) sube un
 * panel con la duracion y el precio; en pantallas tactiles, donde no hay
 * hover, ese panel se ve siempre.
 *
 * Con "destino" es un Link; con "alElegir", un boton que abre la ficha.
 */

import { Link } from 'react-router-dom';
import { IconoReloj, IconoFlecha } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';

export default function TarjetaTour({ tour, etiqueta, destino, alElegir, seleccionada = false }) {
  const { t } = usarIdioma();

  const contenido = (
    <>
      <img src={tour.galeria?.[0] || tour.imagen} alt="" loading="lazy" draggable="false" />
      <span className="tarjeta-velo" aria-hidden="true" />

      <div className="tarjeta-texto">
        {etiqueta && <span className="tarjeta-etiqueta">{etiqueta}</span>}
        <h3>{tour.titulo}</h3>

        <div className="tarjeta-panel">
          {tour.duracion && (
            <span className="tarjeta-duracion"><IconoReloj tamano={15} /> {tour.duracion}</span>
          )}
          {tour.precio && <span className="tarjeta-precio">{tour.precio}</span>}
          <span className="tarjeta-mas">{t.verDetalles} <IconoFlecha tamano={16} /></span>
        </div>
      </div>
    </>
  );

  const clase = `tarjeta revelar${seleccionada ? ' seleccionada' : ''}`;

  if (destino) {
    return <Link to={destino} className={clase}>{contenido}</Link>;
  }

  return (
    <button type="button" className={clase} onClick={() => alElegir(tour)}>
      {contenido}
    </button>
  );
}
