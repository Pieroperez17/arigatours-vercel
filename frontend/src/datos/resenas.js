/**
 * Reseñas de viajeros que se muestran en el inicio.
 *
 * Van aqui, sueltas del componente, para poder anadirlas o quitarlas sin
 * tocar codigo de React. Y en un solo idioma a proposito: son palabras de
 * una persona concreta, y traducirlas seria ponerle en la boca algo que no
 * dijo. Cada una lleva de donde es quien la escribio, que es lo que le da
 * credibilidad.
 *
 * Si algun dia hay que administrarlas desde el panel, esto se sustituye por
 * una tabla y una llamada a la API, igual que se hizo con las portadas.
 */

export const RESENAS = [
  {
    id: 'maria-es',
    texto:
      'Nuestro viaje con ArigaTours fue simplemente increíble. Cada detalle estuvo pensado para nosotros. Sentimos que descubrimos el Japón más auténtico.',
    autor: 'María',
    lugar: 'España',
    estrellas: 5,
  },
  {
    id: 'andres-mx',
    texto:
      'Las guías son excepcionales. No solo conocen Japón, lo viven y lo transmiten con una cercanía que convierte el viaje en algo memorable.',
    autor: 'Andrés',
    lugar: 'México',
    estrellas: 5,
  },
  {
    id: 'lucia-pe',
    texto:
      'Organizaron todo a nuestro ritmo, sin prisas y sin grupos enormes. Volvimos con la sensación de haber entendido el país, no solo de haberlo visitado.',
    autor: 'Lucía',
    lugar: 'Perú',
    estrellas: 5,
  },
];
