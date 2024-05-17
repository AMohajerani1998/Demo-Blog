const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../data/database");

router.get("/", function (req, res) {
    res.render("home");
});

router.get("/sign-up", function (req, res) {
    const csrfToken = req.csrfToken();
    res.render("sign-up", {csrfToken:csrfToken});
});

router.post("/sign-up", async function (req, res) {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredConfirmEmail = userData["email-confirm"];
    const eneteredPassword = userData.password;
    if (
        !eneteredPassword.length ||
        !enteredEmail ||
        !enteredConfirmEmail ||
        !enteredEmail.includes("@") ||
        enteredEmail !== enteredConfirmEmail
    ) {
        console.log("invalid inputs!");
        return res.redirect("/sign-up");
    }
    const existingUser = await db
        .getDb()
        .collection("users")
        .findOne({ email: enteredEmail });
    if (existingUser) {
        console.log("user already exists!");
        return res.redirect("/sign-up");
    }
    hashedPassword = await bcrypt.hash(eneteredPassword, 12);
    await db.getDb().collection("users").insertOne({
        email: enteredEmail,
        password: hashedPassword,
    });
    console.log("profile created");
    res.redirect("/log-in");
});

router.get("/log-in", function (req, res) {
    const csrfToken = req.csrfToken();
    res.render("log-in", {csrfToken:csrfToken});
});

router.post("/log-in", async function (req, res) {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredPassword = userData.password;
    const existingUser = await db.getDb().collection('users').findOne({email: enteredEmail})
    if (!existingUser){
        console.log('user doesn\'t exist! ')
        return res.redirect('/log-in')
    }
    const passwordCheck = await bcrypt.compare(enteredPassword, existingUser.password)
    if (!passwordCheck){
        console.log('password is wrong!')
        return res.redirect('/log-in')
    }
    req.session.isAuthenticated = true;
    req.session.user = {
        id: existingUser._id,
        email: enteredEmail
    }
    req.session.save(function(){
        console.log('ok')
        res.redirect('/new-post')
    })
});

router.get("/new-post", function (req, res) {
    res.render("new-post");
});

module.exports = router;
