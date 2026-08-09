/**
 * Ventana para repartir la pagina de un socio: por enlace o por QR.
 *
 * El QR se genera en el navegador, no lo dibuja ningun servicio externo. Asi
 * la direccion del socio no viaja a terceros y sigue funcionando sin
 * conexion, que importa cuando se prepara una tanda de tarjetas.
 */

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

/**
 * Direccion completa de la pagina, con el dominio desde el que se abre el
 * panel. Se saca de window en vez de escribirla fija para que el QR generado
 * en local apunte a local y el de produccion a produccion: un QR con el
 * dominio equivocado se descubre cuando ya esta impreso.
 */
export function direccionSocio(id) {
  return `${window.location.origin}/contacto/${id}`;
}

export default function CompartirSocio({ socio, alCerrar }) {
  const [copiado, setCopiado] = useState(false);
  const [imagenQr, setImagenQr] = useState('');
  const [errorQr, setErrorQr] = useState(null);

  const direccion = direccionSocio(socio.id);

  useEffect(() => {
    /*
     * Se pide una imagen (toDataURL) y no que dibuje sobre un <canvas>.
     *
     * Con canvas, la libreria escribe el tamano en el propio elemento
     * (style.width = "512px"), y eso gana sobre cualquier regla CSS: el QR
     * salia a 512 px y desbordaba la ventana. Como imagen, los 512 px se
     * quedan donde importan -la resolucion del archivo, para imprimir- y el
     * tamano en pantalla lo decide el CSS.
     *
     * Correccion de errores alta (H): el codigo se sigue leyendo aunque el
     * papel se raye o se manche, que es lo que le pasa a una tarjeta que
     * viaja en un bolsillo.
     */
    QRCode.toDataURL(direccion, { width: 512, margin: 2, errorCorrectionLevel: 'H' })
      .then((url) => { setImagenQr(url); setErrorQr(null); })
      .catch((fallo) => setErrorQr(fallo.message));
  }, [direccion]);

  // Cerrar con Escape: es lo que se espera de cualquier ventana modal.
  useEffect(() => {
    const alPulsar = (evento) => { if (evento.key === 'Escape') alCerrar(); };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [alCerrar]);

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(direccion);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /*
       * El portapapeles falla sin https o si el navegador lo bloquea. En vez
       * de dejar al usuario sin salida se selecciona el texto para que pueda
       * copiarlo a mano con el teclado.
       */
      document.getElementById('compartir-direccion')?.select();
    }
  }

  return (
    <div className="compartir-fondo" role="dialog" aria-modal="true" onClick={alCerrar}>
      {/* El clic dentro no debe cerrar: solo el de fuera. */}
      <div className="compartir-ventana" onClick={(evento) => evento.stopPropagation()}>
        <header className="compartir-cabecera">
          <h3>Compartir a {socio.nombre}</h3>
          <button type="button" className="compartir-cerrar" onClick={alCerrar} aria-label="Cerrar">
            <i className="fas fa-xmark" />
          </button>
        </header>

        <div className="compartir-cuerpo">
          <div className="compartir-qr">
            {errorQr ? (
              <p className="panel-aviso error">No se pudo generar el QR: {errorQr}</p>
            ) : (
              imagenQr && (
                <img
                  className="compartir-imagen"
                  src={imagenQr}
                  alt={`Código QR de la página de ${socio.nombre}`}
                />
              )
            )}

            {imagenQr && (
              <a className="boton-contorno" href={imagenQr} download={`qr-${socio.id}.png`}>
                <i className="fas fa-download" /> Descargar QR
              </a>
            )}
          </div>

          <div className="compartir-enlace">
            <label htmlFor="compartir-direccion">Enlace de la página</label>
            <input
              id="compartir-direccion"
              type="text"
              readOnly
              value={direccion}
              onFocus={(evento) => evento.target.select()}
            />

            <div className="compartir-acciones">
              <button type="button" className="boton-primario" onClick={copiarEnlace}>
                <i className={`fas ${copiado ? 'fa-check' : 'fa-link'}`} />
                {copiado ? ' Copiado' : ' Copiar enlace'}
              </button>

              <a className="boton-contorno" href={direccion} target="_blank" rel="noreferrer">
                <i className="fas fa-arrow-up-right-from-square" /> Abrir
              </a>
            </div>

            <p className="compartir-ayuda">
              Imprime el QR en la tarjeta de {socio.nombre.split(' ')[0]}. Al escanearlo
              se abre esta página con sus botones de contacto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
