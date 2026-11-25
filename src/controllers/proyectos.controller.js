import { pool } from '../config/db.js';
import { ICONOS_PROYECTO } from '../utils/iconosProyecto.js';

const COLUMNAS =
  'ID_PROYECTO AS id, CLAVE AS clave, PROYECTO AS proyecto, OBJETIVO AS objetivo, PARTICIPANTES AS participantes, ICONO AS icono';

// Igual que el sitio original: el tipo se distingue por el inicio de la clave.
const PREFIJO_POR_TIPO = {
  interno: 'ITSLerdo%',
  externo: 'CONACYT%',
};

// Longitudes máximas según las columnas de la tabla `proyecto`.
const LIMITES = { clave: 100, proyecto: 1000, objetivo: 1000, participantes: 500 };

function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, '\\$&');
}

function leerId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ mensaje: 'El identificador del proyecto no es válido.' });
    return null;
  }
  return id;
}

function validarProyecto(cuerpo) {
  const errores = {};
  const datos = {};

  for (const campo of ['clave', 'proyecto']) {
    const valor = typeof cuerpo[campo] === 'string' ? cuerpo[campo].trim() : '';
    if (!valor) {
      errores[campo] = 'Este campo es obligatorio.';
    } else if (valor.length > LIMITES[campo]) {
      errores[campo] = `Máximo ${LIMITES[campo]} caracteres.`;
    }
    datos[campo] = valor;
  }

  for (const campo of ['objetivo', 'participantes']) {
    const valor = typeof cuerpo[campo] === 'string' ? cuerpo[campo].trim() : '';
    if (valor.length > LIMITES[campo]) {
      errores[campo] = `Máximo ${LIMITES[campo]} caracteres.`;
    }
    datos[campo] = valor || null;
  }

  // Sin icono elegido se guarda NULL y la página usa el del área de la clave.
  const icono = typeof cuerpo.icono === 'string' ? cuerpo.icono.trim() : '';
  if (icono && !ICONOS_PROYECTO.includes(icono)) {
    errores.icono = 'El icono elegido no es válido.';
  }
  datos.icono = icono || null;

  return { datos, errores, valido: Object.keys(errores).length === 0 };
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM proyecto WHERE ID_PROYECTO = ?`, [id]);
  return filas[0] || null;
}

// GET /api/proyectos?tipo=interno|externo&q=texto
export async function listarProyectos(req, res) {
  const condiciones = [];
  const valores = [];

  const { tipo } = req.query;
  if (tipo !== undefined) {
    const prefijo = PREFIJO_POR_TIPO[tipo];
    if (!prefijo) {
      return res.status(400).json({ mensaje: 'El tipo debe ser "interno" o "externo".' });
    }
    condiciones.push('CLAVE LIKE ?');
    valores.push(prefijo);
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q) {
    const patron = `%${escaparLike(q)}%`;
    condiciones.push('(CLAVE LIKE ? OR PROYECTO LIKE ? OR OBJETIVO LIKE ? OR PARTICIPANTES LIKE ?)');
    valores.push(patron, patron, patron, patron);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(
    `SELECT ${COLUMNAS} FROM proyecto ${where} ORDER BY ID_PROYECTO`,
    valores
  );
  return res.json(filas);
}

// GET /api/proyectos/:id
export async function obtenerProyecto(req, res) {
  const id = leerId(req, res);
  if (id === null) return undefined;

  const proyecto = await buscarPorId(id);
  if (!proyecto) {
    return res.status(404).json({ mensaje: 'El proyecto no existe.' });
  }
  return res.json(proyecto);
}

// POST /api/proyectos
export async function crearProyecto(req, res) {
  const { datos, errores, valido } = validarProyecto(req.body);
  if (!valido) {
    return res.status(400).json({ mensaje: 'Revisa los campos marcados.', errores });
  }

  const [resultado] = await pool.query(
    'INSERT INTO proyecto (CLAVE, PROYECTO, OBJETIVO, PARTICIPANTES, ICONO) VALUES (?, ?, ?, ?, ?)',
    [datos.clave, datos.proyecto, datos.objetivo, datos.participantes, datos.icono]
  );
  return res.status(201).json({ id: resultado.insertId, ...datos });
}

// PUT /api/proyectos/:id
export async function actualizarProyecto(req, res) {
  const id = leerId(req, res);
  if (id === null) return undefined;

  const { datos, errores, valido } = validarProyecto(req.body);
  if (!valido) {
    return res.status(400).json({ mensaje: 'Revisa los campos marcados.', errores });
  }

  if (!(await buscarPorId(id))) {
    return res.status(404).json({ mensaje: 'El proyecto no existe.' });
  }

  await pool.query(
    'UPDATE proyecto SET CLAVE = ?, PROYECTO = ?, OBJETIVO = ?, PARTICIPANTES = ?, ICONO = ? WHERE ID_PROYECTO = ?',
    [datos.clave, datos.proyecto, datos.objetivo, datos.participantes, datos.icono, id]
  );
  return res.json({ id, ...datos });
}

// DELETE /api/proyectos/:id
export async function eliminarProyecto(req, res) {
  const id = leerId(req, res);
  if (id === null) return undefined;

  const [resultado] = await pool.query('DELETE FROM proyecto WHERE ID_PROYECTO = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensaje: 'El proyecto no existe.' });
  }
  return res.status(204).end();
}
