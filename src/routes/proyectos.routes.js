import { Router } from 'express';
import {
  actualizarProyecto,
  crearProyecto,
  eliminarProyecto,
  listarProyectos,
  obtenerProyecto,
} from '../controllers/proyectos.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { requiereAdmin } from '../middlewares/auth.js';

const router = Router();

// Públicas
router.get('/', asyncHandler(listarProyectos));
router.get('/:id', asyncHandler(obtenerProyecto));

// Solo administrador
router.post('/', requiereAdmin, asyncHandler(crearProyecto));
router.put('/:id', requiereAdmin, asyncHandler(actualizarProyecto));
router.delete('/:id', requiereAdmin, asyncHandler(eliminarProyecto));

export default router;
