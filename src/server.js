import app from './app.js';
import { pool } from './config/db.js';
import { env } from './config/env.js';

try {
  await pool.query('SELECT 1');
  console.log(`Conectado a la base de datos "${env.db.database}".`);
} catch (error) {
  console.error('No se pudo conectar a la base de datos:', error.message);
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
});
