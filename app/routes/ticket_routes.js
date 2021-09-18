const express = require('express')
const passport = require('passport')

const Ticket = require('../models/ticket')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// GET All tickets
router.get('/tickets', requireToken, (req, res, next) => {
  Ticket.find({ owner: req.user._id })
    .then((tickets) => {
      return tickets.map((ticket) => ticket.toObject())
    })
    .then((tickets) => res.status(200).json({ tickets: tickets }))
    .catch(next)
})

// GET single ticket
router.get('/tickets/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Ticket.findById(req.params.id)
    .then(handle404)
    .then((ticket) => requireOwnership(req, ticket))
    .then((ticket) => res.status(200).json({ ticket: ticket.toObject() }))
    .catch(next)
})

// GET users openOrder on sign in OR create one
router.post('/tickets/open', requireToken, (req, res, next) => {
  Ticket.findOne({ owner: req.user._id, completed: false }) // get all  i own
    .then((ticket) => {
      // if tickets = empty array , make a new ticket! and then send it, if tickets = not an empty array we send that one: edge case, multiple open tickets ?!?
      if (ticket === null) {
        // contents, owner, coupon, completed = a ticket
        const newTicket = Ticket.create({
          contents: [],
          owner: req.user._id,
          coupon: '',
          completed: false
        })
        return newTicket
      } else {
        return ticket
      }
    })
    .then((ticket) => {
      res.status(200).json({ ticket: ticket.toObject() })
    })
    .catch(next)
})

// CREATE
router.post('/tickets', requireToken, (req, res, next) => {
  req.body.ticket.owner = req.user.id
  Ticket.create(req.body.ticket)
    .then((ticket) => {
      res.status(201).json({ ticket: ticket.toObject() })
    })
    .catch(next)
})

// UPDATE ticket
router.patch('/tickets/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.ticket.owner
  Ticket.findById(req.params.id)
    .then(handle404)
    .then((ticket) => {
      requireOwnership(req, ticket)

      return ticket.updateOne(req.body.ticket)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DELETE ticket
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
