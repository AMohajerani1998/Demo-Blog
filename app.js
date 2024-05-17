const path = require('path')

const express = require('express');

const db = require('./data/database')

const postRoutes = require('./routes/posts')

const app = express();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

app.use(postRoutes)

db.connectToDatabase().then(function(){
    app.listen(3000)
})