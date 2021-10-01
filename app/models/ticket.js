/* eslint-disable no-unused-vars */
const mongoose = require('mongoose')
// const User = require('./user')

const ticketSchema = new mongoose.Schema(
  {
    ticketName: {
      type: String,
      required: true
    },
    ticketDescription: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    // images: {
    //   type: String,
    //   required: true
    // },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Ticket', ticketSchema)
