const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../data/database");

const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

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
            enteredEmail: "",
            enteredPassword: "",
        };
    }
    req.session.inputData = null;
    res.render("log-in", { inputData: inputData });
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

router.get("/posts", async function (req, res) {
    if (!res.locals.isAuth) {
        console.log("You are not autheticated to access this page!");
        return res.status(401).render("401");
    }
    let inputData = req.session.inputData;
    if (!inputData) {
        inputData = {
            inputError: false,
            enteredPostTitle: "",
            enteredPostContent: "",
        };
    }
    req.session.inputData = null;
    const posts = await db.getDb().collection("posts").find().toArray();
    res.render("posts", { inputData: inputData, posts: posts });
});

router.post("/posts", async function (req, res) {
    const enteredData = req.body;
    const enteredPostTitle = enteredData.title;
    const enteredPostContent = enteredData.content;
    console.log("test");
    if (
        !enteredPostTitle ||
        !enteredPostContent ||
        enteredPostTitle.trim() === 0 ||
        enteredPostContent.trim() === 0
    ) {
        req.session.inputData = {
            inputError: true,
            errorMessage: "Invalid input! Please try again.",
            enteredPostTitle: enteredPostTitle,
            enteredPostContent: enteredPostContent,
        };
        req.session.save(function () {
            return es.redirect("/posts");
        });
        return;
    }
    await db
        .getDb()
        .collection("posts")
        .insertOne({ title: enteredPostTitle, content: enteredPostContent });
    res.redirect("/posts");
});

router.get("/posts/:id/edit", async function (req, res) {
    if (!res.locals.isAuth) {
        console.log("you are not autheticated to access this page!");
        res.redirect("/log-in");
    }
    let postId;
    try {
        postId = new ObjectId(req.params.id);
    } catch (error) {
        res.status(404).render("404");
    }
    const user = await db.getDb().collection("posts").findOne({ _id: postId });
    let inputData = req.session.inputData;
    if (!inputData) {
        inputData = {
            enteredPostTitle: user.title,
            enteredPostContent: user.content,
        };
    }
    req.session.inputData = null;
    res.render("edit-post", { inputData: inputData, postId:user._id });
});

router.post("/posts/:id/edit", async function (req, res) {
    let postId;
    try {
        postId = new ObjectId(req.params.id);
    } catch (error) {
        res.status(404).render("404");
    }
    const enteredData = req.body;
    const enteredPostTitle = enteredData.title;
    const enteredPostContent = enteredData.content;
    console.log("test");
    if (
        !enteredPostTitle ||
        !enteredPostContent ||
        enteredPostTitle.trim() === 0 ||
        enteredPostContent.trim() === 0
    ) {
        req.session.inputData = {
            inputError: true,
            errorMessage: "Invalid input! Please try again.",
            enteredPostTitle: enteredPostTitle,
            enteredPostContent: enteredPostContent,
        };
        req.session.save(function () {
            return res.redirect(`/posts/${postId}/edit`);
        });
        return;
    }
    await db
        .getDb()
        .collection("posts")
        .updateOne(
            { _id: postId },
            { $set: { title: enteredPostTitle, content: enteredPostContent } }
        );
    res.redirect("/posts");
});

router.post("/logout", async function (req, res) {
    req.session.isAuthenticated = false;
    req.session.user = null;
    req.session.save(function () {
        res.redirect("/log-in");
    });
});

module.exports = router;
