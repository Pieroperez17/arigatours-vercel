/**
 * Rutas de blogs — /api/blogs
 */

import { Router } from 'express';
import * as controlador from '../controladores/controladorBlogs.js';
import { verificarSesion } from '../intermedios/verificarSesion.js';
import { subirImagenBlog } from '../intermedios/subirImagenes.js';

const rutas = Router();

rutas.get('/', controlador.listar);
rutas.get('/categorias', controlador.listarCategorias);
rutas.get('/admin/todos', verificarSesion, controlador.listarTodosAdmin);
rutas.get('/:id', controlador.obtener);

rutas.post('/', verificarSesion, subirImagenBlog, controlador.crear);
rutas.put('/:id', verificarSesion, subirImagenBlog, controlador.actualizar);
rutas.delete('/:id', verificarSesion, controlador.eliminar);

export default rutas;
