import { Router } from 'express';
import {
  cambiarPassword,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
} from '../controllers/usuarios.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { requiereAdmin } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas de administradores exigen sesión
router.use(requiereAdmin);

router.get('/', asyncHandler(listarUsuarios));
router.post('/', asyncHandler(crearUsuario));
router.put('/:id/password', asyncHandler(cambiarPassword));
router.delete('/:id', asyncHandler(eliminarUsuario));

export default router;
