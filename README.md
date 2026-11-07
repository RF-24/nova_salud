
# Nova Salud

Sistema de gestión de inventario y ventas para una farmacia, desarrollado como proyecto académico Fullstack.

## Tecnologías utilizadas

- React y Vite para el frontend.
- Node.js y Express para el backend.
- MongoDB y Mongoose para la base de datos.
- JWT y bcryptjs para la autenticación.

## Funcionalidades

- Inicio y cierre de sesión.
- Registro, búsqueda, edición y eliminación de medicamentos.
- Control de stock y stock mínimo.
- Registro de ventas.
- Actualización automática del inventario.
- Historial de ventas.
- Protección de rutas mediante autenticación.

## Requisitos

- Node.js y npm.
- MongoDB instalado y funcionando.

## Instalación del backend

Abrir una terminal en la carpeta backend:

```bash
npm install
```

Crear el archivo `.env` con las variables necesarias para la conexión a MongoDB y la clave JWT.

Ejemplo de configuración:

```env
MONGO_URI=mongodb://127.0.0.1:27017/nova_salud
JWT_SECRET=colocar_una_clave_secreta_segura
```

Los nombres de las variables deben coincidir con los utilizados en `server.js` y las rutas de autenticación.

Crear un usuario administrador usando el script incluido en `backend/scripts/crearAdmin.js`.

Iniciar el servidor con el comando configurado en `backend/package.json`.

## Instalación del frontend

Abrir otra terminal en la carpeta frontend:

```bash
npm install
npm run dev
```

Abrir en el navegador:

http://localhost:5173

El backend utiliza el puerto 3000.

## Acceso al sistema

Para ingresar, primero se debe crear un usuario administrador en la base de datos MongoDB.

La pantalla de inicio de sesión solicita un correo y una contraseña válidos.

## Autor

Rodolfo Flores

Proyecto académico - SENATI
