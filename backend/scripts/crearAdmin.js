
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const Usuario = require("../models/Usuario");

async function crearAdmin() {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout
  });

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Falta MONGO_URI en .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existentes = await Usuario.countDocuments();

    if (existentes > 0) {
      console.log("Ya existe un usuario. No se creó otro.");
      return;
    }

    const nombre = (await rl.question("Nombre: ")).trim();
    const correo = (await rl.question("Correo: "))
      .trim().toLowerCase();
    const password = await rl.question("Contraseña: ");

    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
        password.length < 12) {
      throw new Error(
        "Ingresa nombre, correo válido y contraseña de mínimo 12 caracteres."
      );
    }

    const hash = await bcrypt.hash(password, 12);

    await Usuario.create({
      nombre,
      correo,
      password: hash,
      rol: "administrador"
    });

    console.log("Administrador creado correctamente.");

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

crearAdmin();
