
const express = require("express");
const mongoose = require("mongoose");
const Medicamento = require("../models/Medicamento");
const Venta = require("../models/Venta");

const router = express.Router();

// Consultar historial de ventas
router.get("/", async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fecha: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar ventas"
    });
  }
});

// Registrar una venta
router.post("/", async (req, res) => {
  const { medicamentoId, cantidad } = req.body;

  if (!mongoose.isValidObjectId(medicamentoId) ||
      !Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({
      mensaje: "Medicamento o cantidad incorrecta"
    });
  }

  let medicamento;

  try {
    // Descontar solo si existe suficiente stock
    medicamento = await Medicamento.findOneAndUpdate(
      {
        _id: medicamentoId,
        stock: { $gte: cantidad }
      },
      { $inc: { stock: -cantidad } },
      { new: true }
    );

    if (!medicamento) {
      return res.status(400).json({
        mensaje: "Medicamento inexistente o stock insuficiente"
      });
    }

    const total = Math.round(
      medicamento.precio * cantidad * 100
    ) / 100;

    const venta = await Venta.create({
      medicamento: medicamento._id,
      nombreMedicamento: medicamento.nombre,
      cantidad,
      precioUnitario: medicamento.precio,
      total
    });

    res.status(201).json({
      mensaje: "Venta registrada correctamente",
      venta
    });

  } catch (error) {
    // Intentar devolver el stock si falla el registro
    if (medicamento) {
      try {
        await Medicamento.findByIdAndUpdate(
          medicamento._id,
          { $inc: { stock: cantidad } }
        );
      } catch (reversionError) {
        console.error("Revisar stock:", reversionError);
      }
    }

    console.error("Error en venta:", error);
    res.status(500).json({
      mensaje: "No se pudo completar la venta"
    });
  }
});

module.exports = router;
