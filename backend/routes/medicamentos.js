
const express = require("express");
const mongoose = require("mongoose");
const Medicamento = require("../models/Medicamento");

const router = express.Router();

// Consultar medicamentos
router.get("/", async (req, res) => {
  try {
    const medicamentos = await Medicamento.find().sort({ nombre: 1 });
    res.json(medicamentos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar medicamentos" });
  }
});

// Registrar medicamento
router.post("/", async (req, res) => {
  try {
    const medicamento = new Medicamento(req.body);
    await medicamento.save();

    res.status(201).json(medicamento);
  } catch (error) {
    res.status(400).json({
      mensaje: "Datos del medicamento incorrectos",
      error: error.message
    });
  }
});

// Modificar medicamento
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: "ID incorrecto" });
    }

    const campos = ["nombre", "categoria", "precio", "stock", "stockMinimo"];
    const cambios = Object.fromEntries(
      Object.entries(req.body).filter(([clave]) => campos.includes(clave))
    );

    const medicamento = await Medicamento.findByIdAndUpdate(
      req.params.id,
      { $set: cambios },
      { new: true, runValidators: true }
    );

    if (!medicamento) {
      return res.status(404).json({ mensaje: "Medicamento no encontrado" });
    }

    res.json(medicamento);
  } catch (error) {
    res.status(400).json({ mensaje: "No se pudo modificar", error: error.message });
  }
});

// Eliminar medicamento
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: "ID incorrecto" });
    }

    const medicamento = await Medicamento.findByIdAndDelete(req.params.id);

    if (!medicamento) {
      return res.status(404).json({ mensaje: "Medicamento no encontrado" });
    }

    res.json({ mensaje: "Medicamento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar medicamento" });
  }
});

module.exports = router;
