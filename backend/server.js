const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const verificarToken = require("./middleware/verificarToken");
const medicamentosRoutes = require("./routes/medicamentos");
const ventasRoutes = require("./routes/ventas");

const app = express();

// Seguridad
app.use(helmet());

// Permitir conexión con el frontend
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
}));

// Permitir recibir datos JSON
app.use(express.json({ limit: "100kb" }));

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    mensaje: "Bienvenido a la API de Nova Salud"
  });
});

// Ruta de autenticación
app.use("/api/auth", authRoutes);

// Rutas protegidas con JWT
app.use("/api/medicamentos", verificarToken, medicamentosRoutes);
app.use("/api/ventas", verificarToken, ventasRoutes);

// Iniciar servidor y conectar MongoDB
async function iniciarServidor() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Falta configurar MONGO_URI en .env");
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB conectado correctamente");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Servidor funcionando en http://127.0.0.1:${PORT}`);
    });

  } catch (error) {
    console.error("Error al iniciar servidor:", error.message);
    process.exit(1);
  }
}

iniciarServidor();