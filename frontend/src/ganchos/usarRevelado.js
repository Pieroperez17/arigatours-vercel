/**
 * Aparicion suave al desplazarse: todo lo que lleve la clase "revelar" entra
 * subiendo y aclarandose la primera vez que asoma en pantalla.
 *
 * Un solo observador para toda la pagina, montado en el armazon, en lugar de
 * un gancho por tarjeta. La mayoria del contenido llega de la API despues de
 * montar, asi que un MutationObserver vigila lo que se va anadiendo y lo
 * apunta al vuelo; si no, las tarjetas de tours se quedarian invisibles.
 *
 * El estado va en data-revelado y no en clases: React reescribe className
 * entero cuando cambia (una tarjeta que pasa a "seleccionada"), y una clase
 * puesta desde aqui se perderia o volveria a aparecer a destiempo. Los
 * atributos que React no conoce los deja en paz.
 *
 *   (sin atributo) → aun no apuntado, oculto
 *   espera         → apuntado, oculto hasta que asome
 *   visible        → entrando, con la transicion escalonada
 *   hecho          → ya entro; vuelve a sus propias transiciones de hover
 */

import { useEffect } from 'react';

/*
 * "Pendientes" incluye los que ya estan en espera, no solo los nuevos. Si el
 * observador se desmonta y se vuelve a montar (React lo hace a proposito en
 * desarrollo, y tambien pasaria con un remontaje real), los que el anterior
 * dejo esperando tienen que pasar al nuevo; si no, se quedarian invisibles.
 * Observar dos veces el mismo elemento no hace nada, asi que repetir es inocuo.
 */
const PENDIENTES = '.revelar:not([data-revelado="visible"]):not([data-revelado="hecho"])';
const ESCALON_MS = 90;
const MAXIMO_ESCALONES = 5;

export function usarRevelado() {
  useEffect(() => {
    const raiz = document.getElementById('contenido');
    if (!raiz) return undefined;

    const pideMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (pideMenosMovimiento || !('IntersectionObserver' in window)) {
      const mostrarTodo = () => raiz.querySelectorAll(PENDIENTES).forEach((elemento) => {
        elemento.dataset.revelado = 'hecho';
      });
      mostrarTodo();
      const vigia = new MutationObserver(mostrarTodo);
      vigia.observe(raiz, { childList: true, subtree: true });
      return () => vigia.disconnect();
    }

    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;

        const elemento = entrada.target;
        observador.unobserve(elemento);
        elemento.dataset.revelado = 'visible';

        // Respaldo por si transitionend no llega (pestana en segundo plano).
        const cerrar = () => {
          elemento.dataset.revelado = 'hecho';
          elemento.style.removeProperty('--retraso');
        };
        elemento.addEventListener('transitionend', (evento) => {
          if (evento.target === elemento) cerrar();
        }, { once: true });
        setTimeout(cerrar, 1600);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function apuntarNuevos() {
      raiz.querySelectorAll(PENDIENTES).forEach((elemento) => {
        if (elemento.dataset.revelado === 'espera') {
          observador.observe(elemento);
          return;
        }

        elemento.dataset.revelado = 'espera';

        const hermanos = elemento.parentElement
          ? [...elemento.parentElement.children].filter((hijo) => hijo.classList.contains('revelar'))
          : [];
        const posicion = Math.max(0, hermanos.indexOf(elemento));
        elemento.style.setProperty('--retraso', `${Math.min(posicion, MAXIMO_ESCALONES) * ESCALON_MS}ms`);

        observador.observe(elemento);
      });
    }

    apuntarNuevos();
    const vigia = new MutationObserver(apuntarNuevos);
    vigia.observe(raiz, { childList: true, subtree: true });

    return () => {
      vigia.disconnect();
      observador.disconnect();
    };
  }, []);
}
