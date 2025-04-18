// server.js

// 1. Load environment variables from `.env` into process.env
require('dotenv').config()

// 2. Pull in all our dependencies
const express        = require('express')            // web framework
const mongoose       = require('mongoose')           // MongoDB ORM
const methodOverride = require('method-override')    // allow PUT/DELETE from HTML forms
const session        = require('express-session')    // session middleware
const path           = require('path')               // Node core module for file paths

// 3. Import our own modules
const passUser   = require('./middleware/pass-user-to-view') // make `req.session.user` available in all templates
const isSignedIn = require('./middleware/is-signed-in')      // guard to block unauthenticated access
const authRoutes = require('./controllers/auth')             // signup / signin routes
const foodRoutes = require('./controllers/foods')            // nested `foods` CRUD routes
const userRoutes = require('./controllers/users')            // community user listing & profiles
const User       = require('./models/user')                  // Mongoose model for users

// 4. Create the Express “app” and define port
const app  = express()
const PORT = process.env.PORT || 3000

// ────────────────────────────────────────────────────────────────────────────────
// TEMPLATING SETUP
// ────────────────────────────────────────────────────────────────────────────────

// 5. Tell Express where to find our EJS templates
app.set('views', path.join(__dirname, 'views'))
// 6. Tell Express that we’ll use EJS to render those templates
app.set('view engine', 'ejs')

// ────────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ────────────────────────────────────────────────────────────────────────────────

// 7. Parse URL‑encoded form bodies so req.body works
app.use(express.urlencoded({ extended: true }))
// 8. Look for a `_method` field in those forms and treat it as the HTTP method
app.use(methodOverride('_method'))

// 9. Configure session support
app.use(session({
  secret: process.env.SESSION_SECRET, // used to sign the session ID cookie
  resave: false,                      // don’t save session if nothing changed
  saveUninitialized: false            // don’t make a session until something’s stored
}))
// 10. Inject `res.locals.user = req.session.user
