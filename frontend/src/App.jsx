
import { useEffect, useState } from "react";
import Login from "./Login";
import "./App.css";

const API = "http://127.0.0.1:3000/api/medicamentos";
const API_VENTAS = "http://127.0.0.1:3000/api/ventas";

const formularioVacio = {
  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  stockMinimo: "5"
};

function App() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [ventas, setVentas] = useState([]);
  const [medicamentoVenta, setMedicamentoVenta] = useState("");
  const [cantidadVenta, setCantidadVenta] = useState(1);
  const [vendiendo, setVendiendo] = useState(false);

  // Autenticación
  const [token, setToken] = useState(
    () => sessionStorage.getItem("nova_token") || ""
  );

  const [usuario, setUsuario] = useState(null);

  function iniciarSesion(tokenNuevo, usuarioNuevo) {
    sessionStorage.setItem("nova_token", tokenNuevo);
    setUsuario(usuarioNuevo);
    setMensaje("");
    setToken(tokenNuevo);
  }

  function cerrarSesion() {
    sessionStorage.removeItem("nova_token");
    setToken("");
    setUsuario(null);
    setMedicamentos([]);
    setVentas([]);
    setMensaje("");
    setBusqueda("");
    setEditando(null);
    setFormulario(formularioVacio);
    setMedicamentoVenta("");
    setCantidadVenta(1);
  }

  // Solicitudes protegidas al backend
  async function solicitar(url, opciones = {}) {
    const headers = {
      ...opciones.headers,
      Authorization: `Bearer ${token}`
    };

    const respuesta = await fetch(url, {
      ...opciones,
      headers
    });

    if (respuesta.status === 401) {
      cerrarSesion();
      throw new Error("Tu sesión venció. Inicia sesión nuevamente.");
    }

    return respuesta;
  }

  // Consultar medicamentos
  async function cargarMedicamentos() {
    setCargando(true);

    try {
      const respuesta = await solicitar(API);

      if (!respuesta.ok) {
        throw new Error("Error al consultar medicamentos");
      }

      const datos = await respuesta.json();
      setMedicamentos(datos);

    } catch (error) {
      setMensaje(error.message || "No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  }

  // Consultar historial de ventas
  async function cargarVentas() {
    try {
      const respuesta = await solicitar(API_VENTAS);

      if (!respuesta.ok) {
        throw new Error("Error al consultar ventas");
      }

      const datos = await respuesta.json();
      setVentas(datos);

    } catch (error) {
      setMensaje(error.message || "No se pudo cargar el historial.");
    }
  }

  // Cargar información después de iniciar sesión
  useEffect(() => {
    if (!token) return;

    let activo = true;

    async function cargarDatos() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [respuestaMedicamentos, respuestaVentas] =
          await Promise.all([
            fetch(API, { headers }),
            fetch(API_VENTAS, { headers })
          ]);

        if (!activo) return;

        if (
          respuestaMedicamentos.status === 401 ||
          respuestaVentas.status === 401
        ) {
          cerrarSesion();
          return;
        }

        if (!respuestaMedicamentos.ok || !respuestaVentas.ok) {
          throw new Error("No se pudieron cargar los datos.");
        }

        const [datosMedicamentos, datosVentas] =
          await Promise.all([
            respuestaMedicamentos.json(),
            respuestaVentas.json()
          ]);

        if (!activo) return;

        setMedicamentos(datosMedicamentos);
        setVentas(datosVentas);
        setMensaje("");

      } catch (error) {
        if (activo) {
          setMensaje(error.message || "Error de conexión.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    setCargando(true);
    cargarDatos();

    return () => {
      activo = false;
    };
  }, [token]);

  // Cambiar campos del formulario
  function cambiarCampo(e) {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  }

  // Registrar o editar medicamentos
  async function guardarMedicamento(e) {
    e.preventDefault();

    const datos = {
      nombre: formulario.nombre.trim(),
      categoria: formulario.categoria.trim(),
      precio: Number(formulario.precio),
      stock: Number(formulario.stock),
      stockMinimo: Number(formulario.stockMinimo)
    };

    if (
      !datos.nombre ||
      !datos.categoria ||
      formulario.precio === "" ||
      formulario.stock === "" ||
      formulario.stockMinimo === "" ||
      !Number.isFinite(datos.precio) ||
      datos.precio < 0 ||
      !Number.isInteger(datos.stock) ||
      datos.stock < 0 ||
      !Number.isInteger(datos.stockMinimo) ||
      datos.stockMinimo < 0
    ) {
      setMensaje("Revisa los datos del medicamento.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const url = editando ? `${API}/${editando}` : API;

      const respuesta = await solicitar(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });

      if (!respuesta.ok) {
        const error = await respuesta.json().catch(() => ({}));
        throw new Error(error.mensaje || "No se pudo guardar.");
      }

      setFormulario(formularioVacio);
      setEditando(null);

      await cargarMedicamentos();

      setMensaje("Medicamento guardado correctamente.");

    } catch (error) {
      setMensaje(error.message || "Error al guardar medicamento.");
    } finally {
      setGuardando(false);
    }
  }

  // Preparar edición
  function editarMedicamento(m) {
    setEditando(m._id);

    setFormulario({
      nombre: m.nombre,
      categoria: m.categoria,
      precio: String(m.precio),
      stock: String(m.stock),
      stockMinimo: String(m.stockMinimo)
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // Eliminar medicamento
  async function eliminarMedicamento(id) {
    if (!window.confirm("¿Eliminar este medicamento?")) {
      return;
    }

    try {
      const respuesta = await solicitar(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el medicamento.");
      }

      await cargarMedicamentos();
      setMensaje("Medicamento eliminado correctamente.");

    } catch (error) {
      setMensaje(error.message || "Error al eliminar medicamento.");
    }
  }

  // Buscar medicamentos
  const filtrados = medicamentos.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Estadísticas
  const bajoStock = medicamentos.filter(
    m => m.stock <= m.stockMinimo
  ).length;

  const unidades = medicamentos.reduce(
    (total, m) => total + m.stock,
    0
  );

  const totalVendido = ventas.reduce(
    (total, venta) => total + venta.total,
    0
  );

  // Registrar venta
  async function registrarVenta(e) {
    e.preventDefault();

    const cantidad = Number(cantidadVenta);

    if (
      !medicamentoVenta ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      setMensaje("Selecciona un medicamento y una cantidad válida.");
      return;
    }

    setVendiendo(true);
    setMensaje("");

    try {
      const respuesta = await solicitar(API_VENTAS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          medicamentoId: medicamentoVenta,
          cantidad
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al registrar venta.");
      }

      await Promise.all([
        cargarMedicamentos(),
        cargarVentas()
      ]);

      setMedicamentoVenta("");
      setCantidadVenta(1);
      setMensaje("Venta registrada correctamente.");

    } catch (error) {
      setMensaje(error.message || "No se pudo registrar la venta.");
    } finally {
      setVendiendo(false);
    }
  }

  // Mostrar login si no hay sesión
  if (!token) {
    return <Login onLogin={iniciarSesion} />;
  }

  // Panel principal
  return (
    <div className="aplicacion">

      <aside className="menu">
        <h2>💊 Nova Salud</h2>
        <p>Sistema de botica</p>

        <nav>
          <a href="#inicio">🏠 Inicio</a>
          <a href="#inventario">📦 Inventario</a>
          <a href="#registro">➕ Registrar producto</a>
          <a href="#ventas">💰 Registrar venta</a>
          <a href="#historial">📋 Historial de ventas</a>
        </nav>

        <div className="menu-pie">
          Proyecto Fullstack - SENATI
        </div>
      </aside>

      <main className="contenido">

        <header id="inicio" className="encabezado">
          <div>
            <h1>Panel de administración</h1>
            <p>Control de medicamentos e inventario</p>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span className="usuario">
              {usuario?.nombre || "Administrador"}
            </span>

            <button
              type="button"
              onClick={cerrarSesion}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 14px",
                cursor: "pointer"
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Estadísticas */}
        <section className="estadisticas">

          <div className="tarjeta">
            <span>Medicamentos</span>
            <h2>{medicamentos.length}</h2>
            <p>Productos registrados</p>
          </div>

          <div className="tarjeta">
            <span>Unidades disponibles</span>
            <h2>{unidades}</h2>
            <p>Stock total</p>
          </div>

          <div className="tarjeta alerta">
            <span>Alertas de stock</span>
            <h2>{bajoStock}</h2>
            <p>Productos por reponer</p>
          </div>

        </section>

        {mensaje && (
          <p className="mensaje">{mensaje}</p>
        )}

        {/* Registrar medicamento */}
        <section id="registro" className="panel">
          <h2>
            {editando
              ? "Editar medicamento"
              : "Registrar medicamento"}
          </h2>

          <form
            onSubmit={guardarMedicamento}
            className="formulario"
          >

            <label>
              Nombre del medicamento
              <input
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarCampo}
                placeholder="Ej. Paracetamol"
                required
              />
            </label>

            <label>
              Categoría
              <input
                name="categoria"
                value={formulario.categoria}
                onChange={cambiarCampo}
                placeholder="Ej. Analgésico"
                required
              />
            </label>

            <label>
              Precio (S/)
              <input
                type="number"
                name="precio"
                min="0"
                step="0.01"
                value={formulario.precio}
                onChange={cambiarCampo}
                required
              />
            </label>

            <label>
              Cantidad
              <input
                type="number"
                name="stock"
                min="0"
                step="1"
                value={formulario.stock}
                onChange={cambiarCampo}
                required
              />
            </label>

            <label>
              Stock mínimo
              <input
                type="number"
                name="stockMinimo"
                min="0"
                step="1"
                value={formulario.stockMinimo}
                onChange={cambiarCampo}
                required
              />
            </label>

            <div className="acciones-formulario">
              <button
                type="submit"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : editando
                    ? "Guardar cambios"
                    : "Agregar medicamento"}
              </button>

              {editando && (
                <button
                  type="button"
                  className="secundario"
                  onClick={() => {
                    setEditando(null);
                    setFormulario(formularioVacio);
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>

          </form>
        </section>

        {/* Inventario */}
        <section id="inventario" className="panel">

          <div className="titulo-tabla">
            <h2>Inventario de medicamentos</h2>

            <input
              placeholder="Buscar medicamento..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map(m => (
                  <tr key={m._id}>
                    <td>{m.nombre}</td>
                    <td>{m.categoria}</td>
                    <td>S/ {m.precio.toFixed(2)}</td>
                    <td>{m.stock}</td>

                    <td>
                      <span className={
                        m.stock <= m.stockMinimo
                          ? "estado bajo"
                          : "estado disponible"
                      }>
                        {m.stock === 0
                          ? "Agotado"
                          : m.stock <= m.stockMinimo
                            ? "Stock bajo"
                            : "Disponible"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="editar"
                        onClick={() => editarMedicamento(m)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="eliminar"
                        onClick={() => eliminarMedicamento(m._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!cargando && filtrados.length === 0 && (
              <p className="sin-datos">
                No hay medicamentos para mostrar.
              </p>
            )}

            {cargando && (
              <p className="sin-datos">
                Cargando...
              </p>
            )}
          </div>
        </section>

        {/* Registrar venta */}
        <section id="ventas" className="panel">
          <h2>Registrar venta</h2>
          <p>
            Selecciona un medicamento y la cantidad que deseas vender.
          </p>

          <form
            onSubmit={registrarVenta}
            className="formulario"
          >
            <label>
              Medicamento
              <select
                value={medicamentoVenta}
                onChange={(e) =>
                  setMedicamentoVenta(e.target.value)
                }
                required
              >
                <option value="">
                  Seleccionar medicamento
                </option>

                {medicamentos
                  .filter(m => m.stock > 0)
                  .map(m => (
                    <option key={m._id} value={m._id}>
                      {m.nombre} - S/ {m.precio.toFixed(2)}
                      {" "}({m.stock} disponibles)
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Cantidad
              <input
                type="number"
                min="1"
                step="1"
                value={cantidadVenta}
                onChange={(e) =>
                  setCantidadVenta(e.target.value)
                }
                required
              />
            </label>

            <div className="acciones-formulario">
              <button
                type="submit"
                disabled={vendiendo}
              >
                {vendiendo
                  ? "Registrando..."
                  : "Registrar venta"}
              </button>
            </div>
          </form>
        </section>

        {/* Historial de ventas */}
        <section id="historial" className="panel">
          <h2>Historial de ventas</h2>

          <p>
            Total acumulado de ventas: S/ {totalVendido.toFixed(2)}
          </p>

          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Total</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {ventas.map(venta => (
                  <tr key={venta._id}>
                    <td>{venta.nombreMedicamento}</td>
                    <td>{venta.cantidad}</td>
                    <td>
                      S/ {venta.precioUnitario.toFixed(2)}
                    </td>
                    <td>
                      S/ {venta.total.toFixed(2)}
                    </td>
                    <td>
                      {new Date(venta.fecha).toLocaleString("es-PE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {ventas.length === 0 && (
              <p className="sin-datos">
                Todavía no se han registrado ventas.
              </p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
