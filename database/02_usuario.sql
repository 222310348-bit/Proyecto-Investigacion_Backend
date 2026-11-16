-- Tabla nueva: administradores que pueden iniciar sesión y modificar proyectos.
-- La contraseña nunca se guarda en texto plano, solo su hash (bcrypt).
-- Los usuarios se crean con:  npm run crear-admin -- <usuario> <contraseña>

CREATE TABLE IF NOT EXISTS `usuario` (
  `ID_USUARIO` int(11) NOT NULL AUTO_INCREMENT,
  `USUARIO` varchar(50) NOT NULL,
  `PASSWORD_HASH` varchar(255) NOT NULL,
  PRIMARY KEY (`ID_USUARIO`),
  UNIQUE KEY `USUARIO` (`USUARIO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
