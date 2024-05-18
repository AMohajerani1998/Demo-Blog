const path = require("path");

const express = require("express");
const db = require("./data/database");
const session = require("express-session");
const sessionConfig = require('./config/session')
const csrf = require("csurf");

const authMiddleware = require('./middlewares/auth-middleware')
const csrfTokenMiddleware = require('./middlewares/csrf-token-middleware')

const postRoutes = require("./routes/posts");
const authRoutes = require("./routes/auth");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const mongoDBSessionStore = sessionConfig.createSessionStore(session)
app.use(
    session(sessionConfig.createSessionConfig(mongoDBSessionStore))
);

app.use(csrf());

app.use(csrfTokenMiddleware)

app.use(authMiddleware);

app.use(authRoutes);
app.use(postRoutes);

// app.use(function (req, res){
//     res.status(404).render('404')
// })

// app.use(function(error, req, res, next){
//     res.status(500).render('500')
// })

db.connectToDatabase().then(function () {
    app.listen(3000);
});
