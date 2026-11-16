// Envuelve un controlador asíncrono para que sus errores lleguen al manejador de errores.
export const asyncHandler = (controlador) => (req, res, next) =>
  Promise.resolve(controlador(req, res, next)).catch(next);
