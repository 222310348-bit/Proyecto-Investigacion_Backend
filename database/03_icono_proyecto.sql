-- Agrega a la tabla `proyecto` el icono que el administrador elige para cada proyecto.
-- Se importa una sola vez, después de 01_proyecto.sql.
-- Si ICONO queda en NULL, la página usa el icono del área que indica la clave.
-- Valores permitidos: los de src/utils/iconosProyecto.js

ALTER TABLE `proyecto`
  ADD COLUMN `ICONO` varchar(30) DEFAULT NULL AFTER `PARTICIPANTES`;
