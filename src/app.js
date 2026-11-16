import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/errores.js';
import authRoutes from './routes/auth.routes.js';
import proyectosRoutes from './routes/proyectos.routes.js';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/proyectos', proyectosRoutes);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

export default app;
