import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

export async function iniciarSesion(req, res) {
  const usuario = typeof req.body.usuario === 'string' ? req.body.usuario.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!usuario || !password) {
    return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios.' });
  }

  const [filas] = await pool.query(
    'SELECT ID_USUARIO, USUARIO, PASSWORD_HASH FROM usuario WHERE USUARIO = ?',
    [usuario]
  );
  const encontrado = filas[0];
  const coincide = encontrado ? await bcrypt.compare(password, encontrado.PASSWORD_HASH) : false;

  if (!coincide) {
    return res.status(401).json({ mensaje: 'El usuario o la contraseña son incorrectos.' });
  }

  const token = jwt.sign(
    { id: encontrado.ID_USUARIO, usuario: encontrado.USUARIO },
    env.jwtSecret,
    { expiresIn: env.jwtExpira }
  );

  return res.json({ token, usuario: encontrado.USUARIO });
}

export function perfil(req, res) {
  res.json({ usuario: req.usuario.usuario });
}
