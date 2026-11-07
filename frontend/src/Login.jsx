
import { useState } from "react";

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ correo, password })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al ingresar");
      }

      onLogin(datos.token, datos.usuario);
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-fondo">
      <form className="login-caja" onSubmit={iniciarSesion}>
        <h1>💊 Nova Salud</h1>
        <p>Sistema de administración de botica</p>
        <h2>Iniciar sesión</h2>

        <label>Correo electrónico</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
