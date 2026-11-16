export function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
}

// eslint-disable-next-line no-unused-vars
export function manejadorErrores(error, req, res, next) {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es JSON válido.' });
  }
  console.error(error);
  return res.status(500).json({ mensaje: 'Ocurrió un error en el servidor.' });
}
