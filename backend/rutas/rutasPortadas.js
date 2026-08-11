/**
 * Rutas de portadas — /api/portadas
 */

import { Router } from 'express';
import * as controlador from '../controladores/controladorPortadas.js';
import { verificarSesion } from '../intermedios/verificarSesion.js';
import { subirImagenBlog } from '../intermedios/subirImagenes.js';

const rutas = Router();

// "/admin/todas" va antes que cualquier ruta con parametro, para que no lo
// capture como si "admin" fuera el id de una portada.
rutas.get('/', controlador.listar);
rutas.get('/admin/todas', verificarSesion, controlador.listarTodasAdmin);

rutas.post('/', verificarSesion, subirImagenBlog, controlador.crear);
rutas.patch('/:id', verificarSesion, controlador.cambiarActivo);
rutas.delete('/:id', verificarSesion, controlador.eliminar);

export default rutas;
