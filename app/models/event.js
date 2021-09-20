const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ticketSchema = require('./ticket.js')
const eventSchema = new Schema(
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
    }
  },
  {
    ticket: [ticketSchema]
  },
  {
    timestamps: true,
    minimize: false
  }
)

module.exports = mongoose.model('Event', eventSchema)
