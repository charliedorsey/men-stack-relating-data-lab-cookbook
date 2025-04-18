// 1. Load Mongoose and bcrypt libraries
const mongoose = require('mongoose')  // ORM for MongoDB
const bcrypt   = require('bcrypt')    // for hashing passwords

// ────────────────────────────────────────────────────────────────────────────────
// Define a sub‑schema for individual food items in a user’s pantry
// Pseudocode:
//   • Each food has a `name` field
//   • The `required: true` ensures no unnamed items slip into the pantry
// ────────────────────────────────────────────────────────────────────────────────
const foodSchema = new mongoose.Schema({
  name: { 
    type: String,      // data type is string
    required: true     // must always provide a name
  }
})

// ────────────────────────────────────────────────────────────────────────────────
// Define the main User schema, embedding the foodSchema as an array
// Pseudocode:
//   • username: unique identifier for the user
//   • password: hashed secret (never store plain text!)
//   • pantry: an array of embedded `foodSchema` documents
// ────────────────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username: { 
    type: String,      // store as text
    required: true,    // must have a username
    unique: true       // enforce no duplicates at the DB level
  },
  password: { 
    type: String,      // will hold the bcrypt hash
    required: true     // can’t create a user without a password
  },
  pantry:   [ foodSchema ]  // embedded array of foods inside each user
})

// ────────────────────────────────────────────────────────────────────────────────
// Password‑hashing middleware
// Pseudocode:
//   • Before saving any User document:
//       – if the `password` field was modified (or is new)
//           · replace it with its bcrypt hash
//       – otherwise, leave it unchanged
//   • This ensures we never store a plain‑text password in Mongo
// ────────────────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function () {
  // 'this' refers to the current user document being saved
  if (!this.isModified('password')) {
    // if password wasn’t changed, skip hashing
    return
  }
  // hash the password with a cost factor of 10
  this.password = await bcrypt.hash(this.password, 10)
})

// ────────────────────────────────────────────────────────────────────────────────
// Compile the schema into a Mongoose model and export it
// Pseudocode:
//   • This creates the `users` collection (lowercased, pluralized)
//   • Other parts of the app can then `require('../models/user')`
//     and perform CRUD operations on User documents
// ────────────────────────────────────────────────────────────────────────────────
module.exports = mongoose.model('User', userSchema)
