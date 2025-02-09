
export function consoleStringWidth(text: string) {
    let length = text.length
    let width = 0
    for (let i = 0; i < length; i++) {
        if (text[i] == '\x1b' && text[i + 1] == '[') {
            let oldI = i++;
            let code = 0;
            do {
                code = text.charCodeAt(++i);
            } while ((code >= 48 && code <= 57) || code == 59);

            if (text[i] != 'm') i = oldI;
        }

        width++
    }

    return width
}