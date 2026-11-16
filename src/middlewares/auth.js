import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

// Exige el encabezado "Authorization: Bearer <token>" con un token válido
// de un administrador que siga existiendo en la base de datos.
export async function requiereAdmin(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [esquema, token] = encabezado.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión como administrador.' });
  }

  let datos;
  try {
    datos = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ mensaje: 'La sesión no es válida o ya expiró.' });
  }

  try {
    // Si la cuenta fue eliminada, su sesión deja de servir de inmediato.
    const [filas] = await pool.query(
      'SELECT ID_USUARIO, USUARIO FROM usuario WHERE ID_USUARIO = ?',
      [datos.id]
    );
    if (filas.length === 0) {
      return res.status(401).json({ mensaje: 'La sesión no es válida o ya expiró.' });
    }
    req.usuario = { id: filas[0].ID_USUARIO, usuario: filas[0].USUARIO };
    return next();
  } catch (error) {
    return next(error);
  }
}
