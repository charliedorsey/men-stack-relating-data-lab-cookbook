// controllers/foods.js

// 1. Import dependencies
const express = require('express')
const router  = express.Router({ mergeParams: true }) // preserve :userId from parent route
const User    = require('../models/user')

// ─────────────────────────────────────────────────────────────────
// INDEX — GET /users/:userId/foods
// Purpose: Show all items in this user’s pantry
// Pseudocode:
//   • Read userId from URL params
//   • Fetch the User document from Mongo by its _id
//   • Extract the `pantry` array from that document
//   • Render the "foods/index" view, passing `pantry` and current session user
// ─────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // 1) pull the userId out of the route, e.g. "/users/42/foods"
    const userId = req.params.userId

    // 2) fetch the full User object from database
    const user = await User.findById(userId)

    // 3) render the index.ejs template under views/foods,
    //    giving it the array of items and the logged-in user
    return res.render('foods/index', {
      pantry: user.pantry,
      user:   req.session.user
    })
  } catch (err) {
    console.error(err)
    // on any error, bounce back to homepage
    return res.redirect('/')
  }
})

// ─────────────────────────────────────────────────────────────────
// NEW — GET /users/:userId/foods/new
// Purpose: Show a blank form to create a new pantry item
// Pseudocode:
//   • Render the "foods/new" view, so user can fill in item details
// ─────────────────────────────────────────────────────────────────
router.get('/new', (req, res) => {
  // we still pass the session user so navbar can highlight correctly
  res.render('foods/new', {
    user: req.session.user
  })
})

// ─────────────────────────────────────────────────────────────────
// CREATE — POST /users/:userId/foods
// Purpose: Handle submission of the new‑item form
// Pseudocode:
//   • Read userId from URL
//   • Fetch the User document
//   • Push the form data (req.body) into user.pantry array
//   • Save the User back to Mongo
//   • Optionally flash a success message
//   • Redirect back to the pantry index
// ─────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.params.userId
    const user   = await User.findById(userId)

    // 1) append the new item (e.g. { name: 'Bananas' }) into their pantry
    user.pantry.push(req.body)

    // 2) commit changes
    await user.save()

    // 3) redirect to GET /users/:userId/foods to show updated list
    res.redirect(`/users/${user._id}/foods`)
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// ─────────────────────────────────────────────────────────────────
// SHOW — GET /users/:userId/foods/:itemId
// Purpose: Display details for a single pantry item
// Pseudocode:
//   • Read userId and itemId from URL
//   • Fetch User document
//   • Locate the subdocument by `pantry.id(itemId)`
//   • Render the "foods/show" view with that item
// ─────────────────────────────────────────────────────────────────
router.get('/:itemId', async (req, res) => {
  const user   = await User.findById(req.params.userId)
  const item   = user.pantry.id(req.params.itemId)
  res.render('foods/show', { item })
})

// ─────────────────────────────────────────────────────────────────
// EDIT — GET /users/:userId/foods/:itemId/edit
// Purpose: Show a pre‑filled form to update an existing item
// Pseudocode:
//   • Fetch user & item exactly like SHOW
//   • Render the "foods/edit" view, passing the `item`
// ─────────────────────────────────────────────────────────────────
router.get('/:itemId/edit', async (req, res) => {
  const user = await User.findById(req.params.userId)
  const item = user.pantry.id(req.params.itemId)
  res.render('foods/edit', { item })
})

// ─────────────────────────────────────────────────────────────────
// UPDATE — PUT /users/:userId/foods/:itemId
// Purpose: Process the edit form submission
// Pseudocode:
//   • Fetch User doc
//   • Find the matching pantry subdoc
//   • Use Mongoose’s `.set()` to update fields from req.body
//   • Save the User
//   • Redirect back to the pantry index
// ─────────────────────────────────────────────────────────────────
router.put('/:itemId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  const item = user.pantry.id(req.params.itemId)

  // merge submitted form fields into the subdoc
  item.set(req.body)

  // commit to database
  await user.save()

  // return to the list
  res.redirect(`/users/${user._id}/foods`)
})

// ─────────────────────────────────────────────────────────────────
// DELETE — DELETE /users/:userId/foods/:itemId
// Purpose: Remove an item from the pantry
// Pseudocode:
//   • Fetch User document
//   • Use `pantry.pull(itemId)` to delete the subdocument
//   • Save the User
//   • Redirect back to the pantry index
// ─────────────────────────────────────────────────────────────────
router.delete('/:itemId', async (req, res) => {
  try {
    // 1) lookup user
    const user = await User.findById(req.params.userId)

    // 2) remove the subdoc by its id
    user.pantry.pull(req.params.itemId)

    // 3) save the parent doc
    await user.save()

    // 4) show updated list
    res.redirect(`/users/${user._id}/foods`)
  } catch (err) {
    console.error(err)
    res.redirect('/')
  }
})

// 7. Export the router so it can be mounted in server.js
module.exports = router
