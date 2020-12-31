
export default function(text) {
    return text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
};