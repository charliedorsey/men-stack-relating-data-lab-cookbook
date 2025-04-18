// controllers/users.js

// 1. Import dependencies
const express = require('express')
const router  = express.Router()
const User    = require('../models/user')

// ─────────────────────────────────────────────────────────────────
// COMMUNITY INDEX — GET /users
// Purpose: Show a list of all registered users (community page)
// Pseudocode:
//   • Receive GET request at `/users`
//   • Query the database for all User documents
//   • Render the "users/index" template, passing the array of users
// ─────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // 1) fetch every user from the "users" collection
    const users = await User.find({})

    // 2) render `views/users/index.ejs`,
    //    giving it `users` so it can loop and display each
    res.render('users/index', { users })
  } catch (err) {
    // on error, log and redirect
    console.error(err)
    res.redirect('/')
  }
})

// ─────────────────────────────────────────────────────────────────
// COMMUNITY SHOW — GET /users/:id
// Purpose: View a single user’s public profile (read‑only pantry contents)
// Pseudocode:
//   • Read the `id` param from the URL (e.g. `/users/123`)
//   • Query the database for that User by _id
//   • If found, render "users/show" view, passing the User
//   • If not found or error, handle gracefully (here: redirect home)
// ─────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    // 1) extract the user ID from the URL
    const userId = req.params.id

    // 2) fetch that specific user document
    const u = await User.findById(userId)

    // 3) render `views/users/show.ejs`,
    //    giving it `user` so it can display username + pantry items
    res.render('users/show', { user: u })
  } catch (err) {
    // on error (e.g. invalid ID), log and redirect
    console.error(err)
    res.redirect('/')
  }
})

// 3. Export this router to be mounted in server.js
module.exports = router
