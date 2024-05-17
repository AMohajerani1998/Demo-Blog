const path = require('path')

const express = require('express');
const db = require('./data/database')
const session = require('express-session')
const mongodbStore = require('connect-mongodb-session')
const mongoDBStore = mongodbStore(session)

const csrf = require('csurf')

const postRoutes = require('./routes/posts');

const app = express();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

const sessionStore = new mongoDBStore({
    uri: 'mongodb://localhost:27017',
    databaseName: 'final-blog',
    collection: 'sessions'
})
app.use(session({
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 30 * 24 * 60 * 68 * 1000,
        sameSite: 'lax'
    }
}))

app.use(csrf())

app.use(postRoutes)

db.connectToDatabase().then(function(){
    app.listen(3000)
})