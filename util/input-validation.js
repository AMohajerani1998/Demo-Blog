function postInputValidation(title, content) {
    return (
        title &&
        content &&
        title.trim() !== 0 &&
        content.trim() !== 0
    );
}

module.exports = {
    postInputValidation : postInputValidation,
}