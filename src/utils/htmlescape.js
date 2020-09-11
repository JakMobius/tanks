
module.exports = function(text) {
    return text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}