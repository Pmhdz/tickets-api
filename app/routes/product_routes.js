const express = require('express')
const passport = require('passport')

const Product = require('../models/product')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// GET All products
router.get('/products', requireToken, (req, res, next) => {
  Product.find({ owner: req.user._id })
    .then((products) => {
      return products.map((product) => product.toObject())
    })
    .then((products) => res.status(200).json({ products: products }))
    .catch(next)
})

// GET single product
router.get('/products/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Product.findById(req.params.id)
    .then(handle404)
    .then((product) => requireOwnership(req, product))
    .then((product) => res.status(200).json({ product: product.toObject() }))
    .catch(next)
})

// GET users openOrder on sign in OR create one
router.post('/products/open', requireToken, (req, res, next) => {
  Product.findOne({ owner: req.user._id, completed: false }) // get all products i own
    .then((product) => {
      // if products = empty array , make a new product! and then send it, if products = not an empty array we send that one: edge case, multiple open products ?!?
      if (product === null) {
        // contents, owner, coupon, completed = a product
        const newOrder = Product.create({
          contents: [],
          owner: req.user._id,
          coupon: '',
          completed: false
        })
        return newOrder
      } else {
        return product
      }
    })
    .then((product) => {
      res.status(200).json({ product: product.toObject() })
    })
    .catch(next)
})

// CREATE
router.post('/products', requireToken, (req, res, next) => {
  req.body.product.owner = req.user.id
  Product.create(req.body.product)
    .then((product) => {
      res.status(201).json({ product: product.toObject() })
    })
    .catch(next)
})

// UPDATE product
router.patch('/products/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.product.owner
  Product.findById(req.params.id)
    .then(handle404)
    .then((product) => {
      requireOwnership(req, product)

      return product.updateOne(req.body.product)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DELETE product
router.delete('/products/:id', requireToken, (req, res, next) => {
  Product.findById(req.params.id)
    .then(handle404)
    .then((product) => {
      requireOwnership(req, product)
      product.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
