const bcrypt = require("bcrypt");
const User = require("../models/users");
const sessionValidation = require("../util/session-validation");
const inputValidation = require("../util/input-validation");

function loadSignUpPage(req, res) {
    let inputData = sessionValidation.checkSessionInputData(req, {
        enteredEmail: "",
        enteredConfirmEmail: "",
        enteredPassword: "",
    });
    res.render("sign-up", { inputData: inputData });
}

async function createUser(req, res) {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredConfirmEmail = userData["email-confirm"];
    const enteredPassword = userData.password;
    if (
        !inputValidation.userSignUpInputValidation(
            enteredEmail,
            enteredConfirmEmail,
            enteredPassword
        )
    ) {
        sessionValidation.flashInputError(
            req,
            {
                errorMessage: "Invalid input! Please try again.",
                enteredEmail: enteredEmail,
                enteredConfirmEmail: enteredConfirmEmail,
                enteredPassword: enteredPassword,
            },
            function () {
                return res.redirect("/sign-up");
            }
        );
        return;
    }

    const user = new User(enteredEmail);
    const existingUser = await user.fetch();
    if (existingUser) {
        sessionValidation.flashInputError(
            req,
            {
                errorMessage: "User already exists!",
                enteredEmail: enteredEmail,
                enteredConfirmEmail: enteredConfirmEmail,
                enteredPassword: enteredPassword,
            },
            function () {
                return res.redirect("/sign-up");
            }
        );
        return;
    }
    const hashedPassword = await bcrypt.hash(enteredPassword, 12);
    const newUser = new User(enteredEmail, hashedPassword);
    //await newUser.create();
    console.log("profile created");
    res.redirect("/log-in");
}

function loadLoginPage(req, res) {
    let inputData = sessionValidation.checkSessionInputData(req, {
        enteredEmail: "",
        enteredPassword: "",
    });
    res.render("log-in", { inputData: inputData });
}

async function loginUser(req, res) {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredPassword = userData.password;
    const user = new User(enteredEmail);
    const existingUser = await user.fetch();
    if (!existingUser) {
        sessionValidation.flashInputError(
            req,
            {
                errorMessage: "Email or password is wrong! Try again.",
                enteredEmail: enteredEmail,
                enteredPassword: enteredPassword,
            },
            function () {
                return res.redirect("/log-in");
            }
        );
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
        res.redirect("/posts");
    });
}

async function logoutUser(req, res) {
    req.session.isAuthenticated = false;
    req.session.user = null;
    req.session.save(function () {
        res.redirect("/log-in");
    });
}

module.exports = {
    loadSignUpPage: loadSignUpPage,
    createUser: createUser,
    loadLoginPage: loadLoginPage,
    loginUser: loginUser,
    logoutUser: logoutUser,
};
