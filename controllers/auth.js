// 1. Import dependencies
const express = require('express')      // web framework router
const router  = express.Router()       // create a new router instance
const bcrypt  = require('bcrypt')      // for hashing & comparing passwords

// 2. Import the User model
const User = require('../models/user.js')

// ────────────────────────────────────────────────────────────────
// ROUTE: GET /auth/sign-up
// Purpose: show the user a form where they can choose a username/password
// ────────────────────────────────────────────────────────────────
router.get('/sign-up', (req, res) => {
  // Simply render the 'sign-up' EJS template
  res.render('auth/sign-up.ejs')
})

// ────────────────────────────────────────────────────────────────
// ROUTE: GET /auth/sign-in
// Purpose: show the user a login form
// ────────────────────────────────────────────────────────────────
router.get('/sign-in', (req, res) => {
  // Render the 'sign-in' template so they can enter credentials
  res.render('auth/sign-in.ejs')
})

// ────────────────────────────────────────────────────────────────
// ROUTE: GET /auth/sign-out
// Purpose: log the user out by clearing their session, then redirect
// ────────────────────────────────────────────────────────────────
router.get('/sign-out', (req, res) => {
  // 1) Destroy the server-side session entirely
  req.session.destroy()
  // 2) Send them back to home
  res.redirect('/')
})

// ────────────────────────────────────────────────────────────────
// ROUTE: POST /auth/sign-up
// Purpose: handle new‑user form submission
//   • validate uniqueness
//   • validate password confirmation
//   • hash the password
//   • create the user in Mongo
//   • then redirect to sign‑in page
// ────────────────────────────────────────────────────────────────
router.post('/sign-up', async (req, res) => {
  try {
    // A) Check if someone is already using this username
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (userInDatabase) {
      // If yes: stop and inform them
      return res.send('Username already taken.')
    }

    // B) Make sure password & confirmPassword match
    if (req.body.password !== req.body.confirmPassword) {
      return res.send('Password and Confirm Password must match')
    }

    // C) Hash the chosen password before saving
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    // Override plain-text password field with its hash
    req.body.password = hashedPassword

    // D) Create the new user document in MongoDB
    await User.create(req.body)

    // E) Redirect new user to the login page
    res.redirect('/auth/sign-in')
  } catch (error) {
    // In case anything goes wrong, log & bounce home
    console.error(error)
    res.redirect('/')
  }
})

// ────────────────────────────────────────────────────────────────
// ROUTE: POST /auth/sign-in
// Purpose: handle login form submission
//   • find the user by username
//   • compare submitted password to stored hash
//   • if OK, store minimal user info in session
//   • redirect to home
// ────────────────────────────────────────────────────────────────
router.post('/sign-in', async (req, res) => {
  try {
    // A) Look up user by the username they entered
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (!userInDatabase) {
      // If no such user, fail early
      return res.send('Login failed. Please try again.')
    }

    // B) Compare the submitted password to the hashed one
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    )
    if (!validPassword) {
      // If hash comparison fails, reject login
      return res.send('Login failed. Please try again.')
    }

    // C) Success! Store safe data in session (never store the password)
    req.session.user = {
      _id:      userInDatabase._id,
      username: userInDatabase.username
    }

    // D) Redirect to the home page (or dashboard)
    res.redirect('/')
  } catch (error) {
    // On any unexpected error, log & send back to home
    console.error(error)
    res.redirect('/')
  }
})

// 4. Export this router so server.js can mount it at `/auth`
module.exports = router
