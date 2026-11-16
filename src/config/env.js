import 'dotenv/config';

const requeridas = ['DB_USER', 'DB_NAME', 'JWT_SECRET'];
const faltantes = requeridas.filter((nombre) => !process.env[nombre]);

if (faltantes.length > 0) {
  console.error(`Faltan variables en el archivo .env: ${faltantes.join(', ')}`);
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpira: process.env.JWT_EXPIRA || '8h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
