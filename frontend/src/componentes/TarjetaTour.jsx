/**
 * Tarjeta de un tour: foto con etiqueta, titulo, duracion y precio.
 *
 * Sirve para el inicio, donde es un enlace a la ficha, y para el listado,
 * donde es un boton que abre la ventana de detalle. Se decide por las props:
 * con "destino" es un Link; con "alElegir", un boton.
 *
 * La duracion y el precio van en dos lineas y no enfrentados: en la base hay
 * precios como "$175 USD (Base 2 pax) + $35 USD por persona adicional", que
 * en una sola linea partian la tarjeta por la mitad.
 */

import { Link } from 'react-router-dom';
import { IconoReloj } from './Iconos.jsx';
import { usarIdioma } from '../contexto/ContextoIdioma.jsx';

export default function TarjetaTour({ tour, etiqueta, destino, alElegir, seleccionada = false }) {
  const { t } = usarIdioma();

  const contenido = (
    <>
      <div className="tarjeta-foto">
        {etiqueta && (
          <span className={`insignia${tour.tipo === 'gratuito' ? ' insignia-clara' : ''}`}>{etiqueta}</span>
        )}
        <img src={tour.galeria?.[0] || tour.imagen} alt={tour.titulo} loading="lazy" draggable="false" />
      </div>

      <div className="tarjeta-cuerpo">
        <h3>{tour.titulo}</h3>

        <div className="tarjeta-datos">
          {tour.duracion && (
            <span className="tarjeta-duracion"><IconoReloj tamano={16} /> {tour.duracion}</span>
          )}
          {tour.precio && <span className="tarjeta-precio">{tour.precio}</span>}
        </div>

        <span className="tarjeta-mas">{t.verDetalles} →</span>
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
