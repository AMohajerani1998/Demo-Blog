const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../data/database");

router.get("/", function (req, res) {
    res.render("home");
});

router.get("/sign-up", function (req, res) {
    // const csrfToken = req.csrfToken();
    let inputData = req.session.inputData;
    if (!inputData) {
        inputData = {
            enteredEmail: "",
            enteredConfirmEmail: "",
            enteredPassword: "",
        };
    }
    req.session.inputData = null;
    res.render("sign-up", { inputData: inputData });
});

router.post("/sign-up", async function (req, res) {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredConfirmEmail = userData["email-confirm"];
    const enteredPassword = userData.password;
    if (
        !enteredPassword.length ||
        !enteredEmail ||
        !enteredConfirmEmail ||
        !enteredEmail.includes("@") ||
        enteredEmail !== enteredConfirmEmail
    ) {
        req.session.inputData = {
            inputError: true,
            errorMessage: "Invalid input! Try agagin.",
            enteredEmail: enteredEmail,
            enteredConfirmEmail: enteredConfirmEmail,
            enteredPassword: enteredPassword,
        };
        req.session.save(function () {
            return res.redirect("/sign-up");
        });
        return;
    }
    const existingUser = await db
        .getDb()
        .collection("users")
        .findOne({ email: enteredEmail });
    if (existingUser) {
        req.session.inputData = {
            inputError: true,
            errorMessage: "User already exists!",
            enteredEmail: enteredEmail,
            enteredConfirmEmail: enteredConfirmEmail,
            enteredPassword: enteredPassword,
        };
        req.session.save(function () {
            return res.redirect("/sign-up");
        });
        return;
    }
    hashedPassword = await bcrypt.hash(enteredPassword, 12);
    await db.getDb().collection("users").insertOne({
        email: enteredEmail,
        password: hashedPassword,
    });
    console.log("profile created");
    res.redirect("/log-in");
});

router.get("/log-in", function (req, res) {
    // const csrfToken = req.csrfToken();
    let inputData = req.session.inputData;
    if (!inputData) {
        inputData = {
            enteredEmail: '',
            enteredPassword: ''
        }
    }
    req.session.inputData = null;
    res.render("log-in", {inputData:inputData });
});

router.post("/log-in", async function (req, res) {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredPassword = userData.password;
    const existingUser = await db
        .getDb()
        .collection("users")
        .findOne({ email: enteredEmail });
    if (!existingUser) {
        req.session.inputData = {
            inputError: true,
            errorMessage: "Email or password is wrong! Try again.",
            enteredEmail: enteredEmail,
            enteredPassword: enteredPassword,
        };
        req.session.save(function () {
            return res.redirect("/log-in");
        });
        return;
    }
    const passwordCheck = await bcrypt.compare(
        enteredPassword,
        existingUser.password
    );
    if (!passwordCheck) {
        req.session.inputData = {
            inputError: true,
            errorMessage: "Email or password is wrong! Try again.",
            enteredEmail: enteredEmail,
            enteredPassword: enteredPassword,
        };
        req.session.save(function () {
            return res.redirect("/log-in");
        });
        return;
    }
    req.session.isAuthenticated = true;
    req.session.user = {
        id: existingUser._id,
        email: enteredEmail,
    };
    req.session.save(function () {
        console.log("ok");
        res.redirect("/posts");
    });
});

router.get("/posts", function (req, res) {
    if (!req.session.isAuthenticated){
        console.log('You are not autheticated to access this page!')
        return res.status(401).render('401')
    }
    res.render("posts");
});

router.post('/logout', async function(req, res){
    req.session.isAuthenticated = false;
    req.session.user = null;
    req.session.save(function(){
        res.redirect('/log-in')
    })
})

module.exports = router;
