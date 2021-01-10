
export default function(text: string) {
    return text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
};