import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Exige el encabezado "Authorization: Bearer <token>" con un token válido.
export function requiereAdmin(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [esquema, token] = encabezado.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión como administrador.' });
  }

  try {
    const datos = jwt.verify(token, env.jwtSecret);
    req.usuario = { id: datos.id, usuario: datos.usuario };
    return next();
  } catch {
    return res.status(401).json({ mensaje: 'La sesión no es válida o ya expiró.' });
  }
}
