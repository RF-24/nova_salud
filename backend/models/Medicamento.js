
const mongoose = require("mongoose");

const medicamentoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: Number.isInteger
  },
  stockMinimo: {
    type: Number,
    default: 5,
    min: 0,
    validate: Number.isInteger
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Medicamento", medicamentoSchema);
