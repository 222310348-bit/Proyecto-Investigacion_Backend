import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { LIMITE_USUARIO, errorDePassword, normalizarCorreoInstitucional } from '../utils/validaciones.js';

function leerId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ mensaje: 'El identificador del usuario no es válido.' });
    return null;
  }
  return id;
}

// GET /api/usuarios
export async function listarUsuarios(req, res) {
  const [filas] = await pool.query(
    'SELECT ID_USUARIO AS id, USUARIO AS usuario FROM usuario ORDER BY ID_USUARIO'
  );
  res.json(filas);
}

// POST /api/usuarios   { usuario: correo institucional, password }
export async function crearUsuario(req, res) {
  const errores = {};

  const correo = normalizarCorreoInstitucional(req.body.usuario);
  if (!correo) {
    errores.usuario = `Debe ser un correo institucional (@${env.dominioCorreo}).`;
  } else if (correo.length > LIMITE_USUARIO) {
    errores.usuario = `El correo admite máximo ${LIMITE_USUARIO} caracteres.`;
  }

  const errorPassword = errorDePassword(req.body.password);
  if (errorPassword) {
    errores.password = errorPassword;
  }

  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ mensaje: 'Revisa los campos marcados.', errores });
  }

  const hash = await bcrypt.hash(req.body.password, 10);
  try {
    const [resultado] = await pool.query(
      'INSERT INTO usuario (USUARIO, PASSWORD_HASH) VALUES (?, ?)',
      [correo, hash]
    );
    return res.status(201).json({ id: resultado.insertId, usuario: correo });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensaje: 'Revisa los campos marcados.',
        errores: { usuario: 'Ya existe un administrador con ese correo.' },
      });
    }
    throw error;
  }
}

// PUT /api/usuarios/:id/password   { password }
export async function cambiarPassword(req, res) {
  const id = leerId(req, res);
  if (id === null) return undefined;

  const errorPassword = errorDePassword(req.body.password);
  if (errorPassword) {
    return res.status(400).json({ mensaje: 'Revisa los campos marcados.', errores: { password: errorPassword } });
  }

  const hash = await bcrypt.hash(req.body.password, 10);
  const [resultado] = await pool.query(
    'UPDATE usuario SET PASSWORD_HASH = ? WHERE ID_USUARIO = ?',
    [hash, id]
  );
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: 'El usuario no existe.' });
  }
  return res.status(204).end();
}

// DELETE /api/usuarios/:id
export async function eliminarUsuario(req, res) {
  const id = leerId(req, res);
  if (id === null) return undefined;

  if (id === req.usuario.id) {
    return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta.' });
  }

  // Quien hace la petición existe y no es el eliminado, así que siempre queda al menos un administrador.
  const [resultado] = await pool.query('DELETE FROM usuario WHERE ID_USUARIO = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: 'El usuario no existe.' });
  }
  return res.status(204).end();
}
