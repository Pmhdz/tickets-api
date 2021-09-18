const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    category: String,
    inStock: {
      type: Boolean,
      required: true
    },
    // number of product in stock
    stock: Number
  },
  {
    timestamps: true,
    minimize: false
  }
)

module.exports = mongoose.model('Ticket', ticketSchema)
