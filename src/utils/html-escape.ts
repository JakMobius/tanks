
export default function HTMLEscape(text: string) {
    return text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
};