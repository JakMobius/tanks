import {metaKeyName} from "../../utils/meta-key-name";

export const keyboardKeyMapping: { [key: string]: string | undefined } = {
    "ControlLeft": "Л. Ctrl",
    "ShiftLeft": "Л. Shift",
    "AltLeft": "Л. Alt",
    "MetaLeft": "Л. " + metaKeyName,
    "ControlRight": "П. Ctrl",
    "ShiftRight": "П. Shift",
    "AltRight": "П. Alt",
    "MetaRight": "П. " + metaKeyName,
    "Escape": "Esc",
    "Equal": "=",
    "Minus": "-",
    "BracketLeft": "[",
    "BracketRight": "]",
    "Backslash": "\\",
    "Semicolon": ";",
    "Quote": "'",
    "Comma": ",",
    "Period": ".",
    "Slash": "/",
    "Space": "Пробел",
    "ArrowLeft": "←",
    "ArrowUp": "↑",
    "ArrowRight": "→",
    "ArrowDown": "↓"
}