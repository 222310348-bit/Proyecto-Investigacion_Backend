import { env } from '../config/env.js';

// La columna USUARIO de la tabla admite 50 caracteres; bcrypt solo usa los primeros 72 de la contraseña.
export const LIMITE_USUARIO = 50;
export const LIMITE_PASSWORD = 72;

// Estándar de seguridad de la contraseña
const REGLAS_PASSWORD = [
  { cumple: (texto) => texto.length >= 8, mensaje: 'al menos 8 caracteres' },
  { cumple: (texto) => /\p{Lu}/u.test(texto), mensaje: 'una letra mayúscula' },
  { cumple: (texto) => /\p{Ll}/u.test(texto), mensaje: 'una letra minúscula' },
  { cumple: (texto) => /\d/.test(texto), mensaje: 'un número' },
  { cumple: (texto) => /[^\p{L}\p{N}\s]/u.test(texto), mensaje: 'un símbolo' },
];

// Devuelve el correo en minúsculas si es institucional; si no, null.
export function normalizarCorreoInstitucional(valor) {
  if (typeof valor !== 'string') return null;
  const correo = valor.trim().toLowerCase();
  const dominio = env.dominioCorreo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const formato = new RegExp(`^[a-z0-9]+([._-][a-z0-9]+)*@${dominio}$`);
  return formato.test(correo) ? correo : null;
}

// Devuelve un mensaje de error, o null si la contraseña cumple el estándar.
export function errorDePassword(valor) {
  if (typeof valor !== 'string' || valor.length === 0) {
    return 'La contraseña es obligatoria.';
  }
  if (valor.length > LIMITE_PASSWORD) {
    return `La contraseña admite máximo ${LIMITE_PASSWORD} caracteres.`;
  }
  const faltantes = REGLAS_PASSWORD.filter((regla) => !regla.cumple(valor)).map((regla) => regla.mensaje);
  if (faltantes.length > 0) {
    return `La contraseña debe tener ${faltantes.join(', ')}.`;
  }
  return null;
}
