
const mongoose = require("mongoose");

const ventaSchema = new mongoose.Schema({
  medicamento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicamento",
    required: true
  },
  nombreMedicamento: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Venta", ventaSchema);
