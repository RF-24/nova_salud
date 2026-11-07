
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Usuario = require("../models/Usuario");

const router = express.Router();

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    mensaje: "Demasiados intentos. Espera 15 minutos."
  }
});

router.post("/login", limitarLogin, async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (typeof correo !== "string" ||
        typeof password !== "string" ||
        !correo.trim() || !password) {
      return res.status(400).json({
        mensaje: "Correo y contraseña obligatorios"
      });
    }

    const usuario = await Usuario.findOne({
      correo: correo.trim().toLowerCase()
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    const correcto = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!correcto) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    const token = jwt.sign(
      {
        id: usuario._id.toString(),
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );

    res.json({
      mensaje: "Inicio de sesión correcto",
      token,
      usuario: {
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al iniciar sesión"
    });
  }
});

module.exports = router;
