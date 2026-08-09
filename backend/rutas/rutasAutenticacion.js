/**
 * Rutas de autenticacion — /api/autenticacion
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controlador from '../controladores/controladorAutenticacion.js';
import { verificarSesion } from '../intermedios/verificarSesion.js';

const rutas = Router();

// Limita los intentos de ingreso para frenar ataques de fuerza bruta.
const limitadorIngreso = rateLimit({
  windowMs: 10 * 60 * 1000,  // ventana de 10 minutos
  max: 10,                   // 10 intentos por IP en esa ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de ingreso. Espera unos minutos.' },
});

rutas.post('/ingresar', limitadorIngreso, controlador.ingresar);
rutas.get('/perfil', verificarSesion, controlador.perfil);

export default rutas;
