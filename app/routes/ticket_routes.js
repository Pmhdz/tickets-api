const express = require('express')

const passport = require('passport')

// Mongoose model for tickets
const Ticket = require('../models/ticket')
const User = require('../models/user')
const customErrors = require('../../lib/custom_errors')

// throw a custom error
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router
const router = express.Router()

// Create ticket
router.post('/create-ticket', requireToken, (req, res, next) => {
  req.body.ticket.owner = req.user.id
  Ticket.create(req.body.ticket)
  // create with status 201 and JSON of new "ticket"
    .then((ticket) => res.status(201).json({ ticket: ticket.toObject() }))
    .catch(next)
})

// Show ticket
router.get('/tickets/:id/', requireToken, (req, res, next) => {
  Ticket.findById(req.params.id)
    .then(handle404)
    .then((ticket) => res.status(200).json({ ticket: ticket.toObject() }))
    .catch(next)
})
// Get all tickets
router.get('/tickets', (req, res, next) => {
  console.log(req)
  User.findById(req.query.user)
    .then((user) => Ticket.find({ owner: user }))
    .then((ticket) => {
      return ticket.map((ticket) => ticket.toObject())
    })
    .then((ticket) => res.status(200).json({ ticket: ticket }))
    .catch(next)
})
// Update ticket
router.patch('/tickets/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.ticket.owner

  Ticket.findById(req.params.id)
    .then(handle404)
    .then((ticket) => {
      requireOwnership(req, ticket)
      return ticket.updateOne(req.body.ticket)
    })
  // return 204
    .then(() => res.sendStatus(204))
  // throw passer if error occur
    .catch(next)
})

// Delete ticket
router.delete('/tickets/:id', requireToken, (req, res, next) => {
  Ticket.findById(req.params.id)
    .then(handle404)
    .then((ticket) => {
      requireOwnership(req, ticket)
      ticket.deleteOne()
    })

    .then(() => res.sendStatus(204))

    .catch(next)
})

module.exports = router
