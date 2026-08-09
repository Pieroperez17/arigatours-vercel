/**
 * Ventana para repartir la pagina de un socio: por enlace o por QR.
 *
 * El QR se dibuja en el navegador, no lo genera ningun servicio externo. Asi
 * la direccion del socio no viaja a terceros y sigue funcionando sin
 * conexion, que importa cuando se prepara una tanda de tarjetas.
 */

import { useState, useEffect, useRef } from 'react';
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
  const [errorQr, setErrorQr] = useState(null);
  const lienzo = useRef(null);

  const direccion = direccionSocio(socio.id);

  useEffect(() => {
    if (!lienzo.current) return;

    /*
     * 512 px y margen de 2 modulos: da un PNG con resolucion de sobra para
     * imprimir la tarjeta. Un QR pensado solo para la pantalla se ve pixelado
     * al llevarlo al papel.
     *
     * Correccion de errores alta (H): el codigo se sigue leyendo aunque el
     * papel se raye o se manche, que es lo que le pasa a una tarjeta que
     * viaja en un bolsillo.
     */
    QRCode.toCanvas(
      lienzo.current,
      direccion,
      { width: 512, margin: 2, errorCorrectionLevel: 'H' },
      (fallo) => setErrorQr(fallo ? fallo.message : null),
    );
  }, [direccion]);

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
      const campo = document.getElementById('compartir-direccion');
      if (campo) campo.select();
    }
  }

  /** Descarga el QR como PNG, listo para mandar a la imprenta. */
  function descargarQr() {
    if (!lienzo.current) return;

    const enlace = document.createElement('a');
    enlace.download = `qr-${socio.id}.png`;
    enlace.href = lienzo.current.toDataURL('image/png');
    enlace.click();
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
              <p className="panel-error">No se pudo generar el QR: {errorQr}</p>
            ) : (
              <canvas ref={lienzo} className="compartir-lienzo" />
            )}
            <button type="button" className="boton-contorno" onClick={descargarQr}>
              <i className="fas fa-download" /> Descargar QR
            </button>
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

              <a
                className="boton-contorno"
                href={direccion}
                target="_blank"
                rel="noreferrer"
              >
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
