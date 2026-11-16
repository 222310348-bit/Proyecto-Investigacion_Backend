// Crea un administrador o cambia la contraseña de uno existente.
// Uso:  npm run crear-admin -- <correo institucional> <contraseña>
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { LIMITE_USUARIO, errorDePassword, normalizarCorreoInstitucional } from '../utils/validaciones.js';

const [usuario, password] = process.argv.slice(2);

function terminarConError(mensaje) {
  console.error(mensaje);
  process.exitCode = 1;
}

async function principal() {
  if (!usuario || !password) {
    return terminarConError('Uso: npm run crear-admin -- <correo institucional> <contraseña>');
  }

  const errorPassword = errorDePassword(password);
  if (errorPassword) {
    return terminarConError(errorPassword);
  }

  const hash = await bcrypt.hash(password, 10);

  // Si la cuenta ya existe solo se le cambia la contraseña (sirve para la cuenta inicial "Admin").
  const [existentes] = await pool.query('SELECT ID_USUARIO, USUARIO FROM usuario WHERE USUARIO = ?', [usuario.trim()]);
  if (existentes.length > 0) {
    await pool.query('UPDATE usuario SET PASSWORD_HASH = ? WHERE ID_USUARIO = ?', [hash, existentes[0].ID_USUARIO]);
    console.log(`Contraseña de "${existentes[0].USUARIO}" actualizada.`);
    return undefined;
  }

  // Las cuentas nuevas siempre se crean con un correo institucional.
  const correo = normalizarCorreoInstitucional(usuario);
  if (!correo) {
    return terminarConError(`El usuario debe ser un correo institucional (@${env.dominioCorreo}).`);
  }
  if (correo.length > LIMITE_USUARIO) {
    return terminarConError(`El correo admite máximo ${LIMITE_USUARIO} caracteres.`);
  }

  await pool.query('INSERT INTO usuario (USUARIO, PASSWORD_HASH) VALUES (?, ?)', [correo, hash]);
  console.log(`Administrador "${correo}" creado.`);
  return undefined;
}

try {
  await principal();
} catch (error) {
  terminarConError(`No se pudo guardar el administrador: ${error.message}`);
} finally {
  await pool.end();
}
