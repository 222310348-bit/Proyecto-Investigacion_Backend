// Crea un administrador o cambia su contraseña.
// Uso:  npm run crear-admin -- <usuario> <contraseña>
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const [usuario, password] = process.argv.slice(2);

if (!usuario || !password) {
  console.error('Uso: npm run crear-admin -- <usuario> <contraseña>');
  process.exit(1);
}
if (usuario.length > 50) {
  console.error('El usuario admite máximo 50 caracteres.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres.');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO usuario (USUARIO, PASSWORD_HASH) VALUES (?, ?) ON DUPLICATE KEY UPDATE PASSWORD_HASH = VALUES(PASSWORD_HASH)',
    [usuario, hash]
  );
  console.log(`Administrador "${usuario}" guardado.`);
} catch (error) {
  console.error('No se pudo guardar el administrador:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
