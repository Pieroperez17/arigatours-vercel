/**
 * Rutas de socios — /api/socios
 */

import { Router } from 'express';
import * as controlador from '../controladores/controladorSocios.js';
import { verificarSesion } from '../intermedios/verificarSesion.js';
import { subirImagenBlog } from '../intermedios/subirImagenes.js';

const rutas = Router();

// "/admin/todos" va antes que "/:id" para que no lo capture como si "admin"
// fuera el identificador de un socio.
rutas.get('/', controlador.listar);
rutas.get('/admin/todos', verificarSesion, controlador.listarTodosAdmin);
rutas.get('/:id', controlador.obtener);

rutas.post('/', verificarSesion, subirImagenBlog, controlador.crear);
rutas.put('/:id', verificarSesion, subirImagenBlog, controlador.actualizar);
rutas.delete('/:id', verificarSesion, controlador.eliminar);

export default rutas;
