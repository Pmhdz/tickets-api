const { model } = require('mongoose')
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
    place: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)
model.exports = ticketSchema
