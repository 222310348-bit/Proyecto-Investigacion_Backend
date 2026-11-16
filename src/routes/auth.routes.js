import { Router } from 'express';
import { iniciarSesion, perfil } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { requiereAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/login', asyncHandler(iniciarSesion));
router.get('/perfil', requiereAdmin, perfil);

export default router;
