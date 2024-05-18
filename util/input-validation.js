function postInputValidation(title, content) {
    return (
        title &&
        content &&
        title.trim() !== 0 &&
        content.trim() !== 0
    );
}

function userSignUpInputValidation (email, confirmEmail, password){
    return (
        password.length &&
        email &&
        confirmEmail &&
        email.includes("@") &&
        email === confirmEmail
    )
}

module.exports = {
    postInputValidation : postInputValidation,
    userSignUpInputValidation : userSignUpInputValidation,

}