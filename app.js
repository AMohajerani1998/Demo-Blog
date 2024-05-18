const path = require("path");

const express = require("express");
const db = require("./data/database");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session");
const mongoDBStore = mongodbStore(session);

const csrf = require("csurf");

const postRoutes = require("./routes/posts");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const sessionStore = new mongoDBStore({
    uri: "mongodb://localhost:27017",
    databaseName: "final-blog",
    collection: "sessions",
});
app.use(
    session({
        secret: "super-secret",
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            maxAge: 30 * 24 * 60 * 68 * 1000,
            sameSite: "lax",
        },
    })
);

app.use(csrf());

app.use(async function (req, res, next) {
    const userData = req.session.user;
    const isAuth = req.session.isAuthenticated;
    const csrfToken = req.csrfToken();
    res.locals.csrfToken = csrfToken;
    if (!userData || !isAuth) {
        return next();
    }
    const user = await db
        .getDb()
        .collection("users")
        .findOne({ _id: userData.id });
    const isAdmin = user.isAdmin;
    res.locals.isAdmin = isAdmin;
    res.locals.isAuth = isAuth;
    next();
});

app.use(postRoutes);

app.use(function (req, res){
    res.status(404).render('404')
})

app.use(function(error, req, res, next){
    res.status(500).render('500')
})

db.connectToDatabase().then(function () {
    app.listen(3000);
});
