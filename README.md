# Proyecto-Investigacion_Backend

API REST del portal "Investigación y Desarrollo Tecnológico" del ITS de Lerdo.
Conecta el frontend en React con la base de datos MySQL `bdinvestigacion` y permite
que un administrador cree, edite y elimine proyectos sin entrar a phpMyAdmin.

- **Tecnología:** Node.js 20 o superior, Express, MySQL.
- **Base de datos:** la tabla `proyecto` original con una columna nueva `ICONO` (icono que elige el administrador), más una tabla nueva `usuario` para los administradores.

## Estructura

```
database/
  00_crear_bd.sql      Crea la base bdinvestigacion
  01_proyecto.sql      Volcado original de la tabla proyecto (39 registros), sin modificar
  02_usuario.sql       Tabla nueva de administradores
  03_icono_proyecto.sql  Agrega la columna ICONO a la tabla proyecto
src/
  server.js            Arranque: comprueba la conexión y levanta la API
  app.js               Configuración de Express y rutas
  config/              Variables de entorno y conexión a MySQL
  controllers/         Lógica de proyectos, inicio de sesión y administradores
  middlewares/         Verificación de sesión y manejo de errores
  routes/              Definición de rutas
  utils/validaciones.js  Reglas del correo institucional y de la contraseña
  utils/iconosProyecto.js  Iconos que se pueden asignar a un proyecto
  scripts/crearAdmin.js  Alta del primer administrador desde la terminal
```

## Instalación

1. Instalar dependencias:

   ```
   npm install
   ```

2. Crear la base de datos. Si ya tienes `bdinvestigacion` con la tabla `proyecto`,
   ejecuta solo los archivos 02 y 03 (el 02 solo si aún no lo importaste):

   ```
   mysql -u root -p < database/00_crear_bd.sql
   mysql -u root -p bdinvestigacion < database/01_proyecto.sql
   mysql -u root -p bdinvestigacion < database/02_usuario.sql
   mysql -u root -p bdinvestigacion < database/03_icono_proyecto.sql
   ```

   El archivo 03 se importa una sola vez: si se repite, MySQL avisa que la columna `ICONO` ya existe.

   También se pueden importar desde phpMyAdmin en ese mismo orden.

3. Copiar `.env.example` como `.env` y llenar usuario y contraseña de MySQL y `JWT_SECRET`.

4. Crear el primer administrador:

   ```
   npm run crear-admin -- <correo institucional> <contraseña>
   ```

   El mismo comando cambia la contraseña de un usuario existente. Después, los demás
   administradores se dan de alta desde el panel de la página.

5. Iniciar la API:

   ```
   npm run dev      (desarrollo, se reinicia al guardar cambios)
   npm start        (producción)
   ```

## Rutas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/salud` | Público | Comprueba que la API responde |
| GET | `/api/proyectos` | Público | Lista de proyectos |
| GET | `/api/proyectos/:id` | Público | Un proyecto |
| POST | `/api/auth/login` | Público | Inicio de sesión de administrador |
| GET | `/api/auth/perfil` | Administrador | Comprueba que la sesión sigue vigente |
| POST | `/api/proyectos` | Administrador | Crea un proyecto |
| PUT | `/api/proyectos/:id` | Administrador | Actualiza un proyecto |
| DELETE | `/api/proyectos/:id` | Administrador | Elimina un proyecto |
| GET | `/api/usuarios` | Administrador | Lista de administradores |
| POST | `/api/usuarios` | Administrador | Da de alta un administrador |
| PUT | `/api/usuarios/:id/password` | Administrador | Cambia la contraseña de un administrador |
| DELETE | `/api/usuarios/:id` | Administrador | Elimina un administrador |

### Filtros de la lista

- `?tipo=interno` devuelve los proyectos cuya clave empieza con `ITSLerdo`.
- `?tipo=externo` devuelve los que empiezan con `CONACYT`.
- `?q=texto` busca en clave, proyecto, objetivo y participantes.

Es la misma regla que usaba el `index.php` original para separar proyectos internos y externos.

### Formato de un proyecto

```json
{
  "id": 1,
  "clave": "CONACYT 214582",
  "proyecto": "Título del proyecto",
  "objetivo": "Objetivo del proyecto",
  "participantes": "Nombre Uno / Nombre Dos",
  "icono": "vinculacion"
}
```

Para crear o actualizar se envían `clave` y `proyecto` (obligatorios), `objetivo` y
`participantes` (opcionales) e `icono` (opcional: uno de `src/utils/iconosProyecto.js`, o vacío para usar
el icono del área de la clave). Los límites son los de la tabla: clave 100 caracteres,
proyecto 1000, objetivo 1000, participantes 500.

### Sesión de administrador

`POST /api/auth/login` recibe `{ "usuario": "...", "password": "..." }` y responde
`{ "token": "...", "id": 1, "usuario": "..." }`. Las rutas de administrador exigen el encabezado:

```
Authorization: Bearer <token>
```

El token expira según `JWT_EXPIRA` (8 horas por defecto).

### Administradores

`POST /api/usuarios` recibe `{ "usuario": "correo", "password": "..." }`.

- **Correo:** debe ser institucional, es decir, terminar en `@itslerdo.edu.mx`
  (configurable con `DOMINIO_CORREO` en `.env`). Se guarda en minúsculas.
- **Contraseña:** mínimo 8 caracteres con al menos una mayúscula, una minúscula,
  un número y un símbolo. La misma regla aplica al cambiarla y en `crear-admin`.
- Un administrador no puede eliminar su propia cuenta, así que siempre queda al menos uno.
- Si una cuenta se elimina, su sesión deja de funcionar de inmediato.
- La cuenta inicial `Admin` se conserva aunque no sea un correo; la regla del correo
  aplica a las cuentas nuevas.

### Errores

Las respuestas de error tienen la forma `{ "mensaje": "..." }`. Los errores de
validación (400) incluyen además `errores` con un mensaje por campo.
