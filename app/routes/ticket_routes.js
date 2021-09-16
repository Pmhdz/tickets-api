const express = require('express')
const passport = require('passport')

const Ticket = require('../models/ticket')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
// const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
// const User = require('../models/user')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// CREATE tickets
router.post('/tickets', requireToken, (req, res, next) => {
  Ticket.create(req.body.ticket)
    .then((ticket) => {
      res.status(201).json({ ticket: ticket.toObject() })
    })
    .catch(next)
})

// GET All ticket
router.get('/tickets', (req, res, next) => {
  Ticket.find()
    .then((tickets) => {
      return tickets.map((ticket) => ticket.toObject())
    })
    .then((tickets) => res.status(200).json({ tickets: tickets }))
    .catch(next)
})

// GET single tickets
router.get('/tickets/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Ticket.findById(req.params.id)
    .then(handle404)
    .then((ticket) => res.status(200).json({ ticket: ticket.toObject() }))
    .catch(next)
})

// UPDATE tickets
router.patch('/tickets/:id', requireToken, removeBlanks, (req, res, next) => {
  Ticket.findById(req.params.id)
    .then(handle404)
    .then((ticket) => ticket.updateOne(req.body.ticket))
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DELETE tickets
router.delete('/tickets/:id', requireToken, (req, res, next) => {
  Ticket.findById(req.params.id)
    .then(handle404)
    .then((ticket) => ticket.deleteOne())
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
