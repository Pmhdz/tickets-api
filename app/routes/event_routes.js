const express = require('express')
const passport = require('passport')

const Event = require('../models/event')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// GET All events
router.get('/events', requireToken, (req, res, next) => {
  Event.find()
    .then((events) => {
      return events.map((event) => event.toObject())
    })
    .then((events) => res.status(200).json({ events: events }))
    .catch(next)
})

// GET single event
router.get('/events/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Event.findById(req.params.id)
    .then(handle404)
    .then((event) => res.status(200).json({ event: event.toObject() }))
    .catch(next)
})

// CREATE
router.post('/events', requireToken, (req, res, next) => {
  req.body.event.owner = req.user.id
  Event.create(req.body.event)
    .then((event) => {
      res.status(201).json({ event: event.toObject() })
    })
    .catch(next)
})

// UPDATE event
router.patch('/events/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.event.owner
  Event.findById(req.params.id)
    .then(handle404)
    .then((event) => {
      requireOwnership(req, event)

      return event.updateOne(req.body.event)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DELETE event
router.delete('/events/:id', requireToken, (req, res, next) => {
  Event.findById(req.params.id)
    .then(handle404)
    .then((event) => {
      requireOwnership(req, event)
      event.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
