/**
 * Rutas de tours — /api/tours
 *
 * IMPORTANTE: las rutas fijas ("/ciudades", "/admin/todos") van declaradas
 * ANTES que "/:id", porque si no Express interpretaria "ciudades" como un id.
 */

import { Router } from 'express';
import * as controlador from '../controladores/controladorTours.js';
import { verificarSesion } from '../intermedios/verificarSesion.js';
import { subirImagenesTour } from '../intermedios/subirImagenes.js';

const rutas = Router();

// ── Publicas ──────────────────────────────────────────────────────────────
rutas.get('/', controlador.listar);
rutas.get('/ciudades', controlador.listarCiudades);

// ── Privadas (panel de administracion) ────────────────────────────────────
rutas.get('/admin/todos', verificarSesion, controlador.listarTodosAdmin);
rutas.get('/:id/edicion', verificarSesion, controlador.obtenerParaEdicion);

// ── Publica: detalle de un tour ───────────────────────────────────────────
rutas.get('/:id', controlador.obtener);

// ── Escritura (siempre con sesion valida) ─────────────────────────────────
rutas.post('/', verificarSesion, subirImagenesTour, controlador.crear);
rutas.put('/:id', verificarSesion, subirImagenesTour, controlador.actualizar);
rutas.delete('/:id', verificarSesion, controlador.eliminar);

export default rutas;
