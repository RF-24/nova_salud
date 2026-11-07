# Nova Salud

Sistema de gestión de inventario y ventas para una farmacia, desarrollado como proyecto académico Fullstack de SENATI.

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

- Node.js y npm instalados.
- MongoDB instalado y funcionando.
- MongoDB Compass para importar la base de datos.
- Carpeta `BD NOVA` proporcionada junto con el proyecto.

## Instalación del proyecto

1. Descargar el repositorio desde GitHub:

https://github.com/RF-24/nova_salud

2. Abrir el proyecto en Visual Studio Code.

3. Abrir una terminal dentro de la carpeta `backend` e instalar las dependencias:

```bash
npm install
```

4. Copiar el archivo `.env.example` y crear un archivo llamado `.env` dentro de la carpeta `backend`.

5. Configurar el archivo `.env` con los siguientes valores:

```env
MONGO_URI=mongodb://127.0.0.1:27017/nova_salud
JWT_SECRET=reemplazar_por_una_clave_aleatoria_de_32_caracteres_o_mas
PORT=3000
```

La clave `JWT_SECRET` debe reemplazarse por una clave aleatoria y segura de al menos 32 caracteres.

## Importación de la base de datos

La carpeta `BD NOVA` contiene los archivos exportados de MongoDB:

- `nova_salud.medicamentos.json`: medicamentos registrados.
- `nova_salud.usuarios.json`: cuenta de administrador.
- `nova_salud.ventas.json`: historial de ventas.

Para importar los datos:

1. Abrir MongoDB Compass y conectarse al servidor local.
2. Crear una base de datos llamada `nova_salud` con una colección llamada `medicamentos`.
3. Crear las otras dos colecciones: `usuarios` y `ventas`.
4. Ingresar a la colección `medicamentos` y seleccionar la opción de importar datos.
5. Elegir el archivo `nova_salud.medicamentos.json` y el formato JSON.
6. Repetir el procedimiento con los archivos de `usuarios` y `ventas`, importando cada uno en su colección correspondiente.

La importación debe conservar los identificadores originales de los documentos.

Los archivos deben importarse en una base de datos vacía para evitar documentos duplicados.

## Ejecución del backend

Abrir una terminal dentro de la carpeta `backend` y ejecutar:

```bash
npm start
```

El servidor estará disponible en:

http://127.0.0.1:3000

## Ejecución del frontend

Abrir otra terminal dentro de la carpeta `frontend` y ejecutar:

```bash
npm install
npm run dev
```

Abrir en el navegador:

http://localhost:5173

El backend debe permanecer encendido mientras se utiliza el sistema.

## Acceso al sistema

Para ingresar a Nova Salud se utiliza la cuenta de administrador incluida en el respaldo de la base de datos.

El correo y la contraseña de demostración se proporcionan de manera privada junto con los archivos de la base de datos.

No es necesario crear un administrador nuevo si la colección `usuarios` se importó correctamente.

## Autor

Rodolfo Flores

Proyecto académico - SENATI