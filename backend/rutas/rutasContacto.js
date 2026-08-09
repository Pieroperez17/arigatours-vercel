/**
 * Rutas de contacto — /api/contacto
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controlador from '../controladores/controladorContacto.js';
import { verificarSesion } from '../intermedios/verificarSesion.js';

const rutas = Router();

// Evita que un bot inunde el formulario (y la bandeja de correo).
const limitadorEnvios = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hora
  max: 8,                    // 8 consultas por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has enviado demasiadas consultas. Intenta de nuevo mas tarde.' },
});

rutas.post('/', limitadorEnvios, controlador.enviarConsulta);

// Gestion de las consultas recibidas (solo con sesion iniciada)
rutas.get('/consultas', verificarSesion, controlador.listarConsultas);
rutas.patch('/consultas/:id', verificarSesion, controlador.cambiarEstadoConsulta);
rutas.delete('/consultas/:id', verificarSesion, controlador.eliminarConsulta);

export default rutas;
