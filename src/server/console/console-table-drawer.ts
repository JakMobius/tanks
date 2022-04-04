import stringRepeat from "../../utils/string-repeat";
import Logger from "../log/logger";

function consoleStringWidth(text: string) {
    let length = text.length
    let width = 0
    for (let i = 0; i < length; i++) {
        if (text[i] == '\x1b' && text[i + 1] == '[') {
            let old_i = i++;
            let code = 0;
            do {
                code = text.charCodeAt(++i);
            } while ((code >= 48 && code <= 57) || code == 59);

            if (text[i] != 'm') i = old_i;
        }

        width++
    }

    return width
}

export interface ConsoleTableDrawerConfig {
    lines: string[][]
    rowPadding: number
}

export default class ConsoleTableDrawer {
    lines: string[][];
    rowWidths: number[]
    rows?: number = null
    rowPadding: number;

    constructor(config: ConsoleTableDrawerConfig) {
        this.lines = this.convertColors(config.lines)
        this.rowPadding = config.rowPadding
        this.countLineLength()
    }


    private countLineLength() {
        for (let line of this.lines) {
            if (this.rows === null) {
                this.rows = line.length
            } else if (this.rows != line.length) {
                throw new Error("Number of rows must be equal on each line")
            }

            if (!this.rowWidths) this.rowWidths = new Array(this.rows)

            for (let i = 0; i < this.rows; i++) {
                let stringWidth = consoleStringWidth(line[i])
                if (this.rowWidths[i] === undefined || this.rowWidths[i] < stringWidth) {
                    this.rowWidths[i] = stringWidth
                }
            }
        }
    }

    public draw() {
        let result = ""

        for (let line of this.lines) {
            for (let i = 0; i < this.rows; i++) {
                let perfectRowWidth = this.rowWidths[i] + this.rowPadding
                let stringWidth = consoleStringWidth(line[i])

                if (perfectRowWidth == stringWidth || i == (this.rows - 1)) {
                    result += line[i]
                } else {
                    result += (line[i] + stringRepeat(" ", perfectRowWidth - stringWidth))
                }
            }

            result += "\n"

        }

        return result
    }

    private convertColors(lines: string[][]) {
        return lines.map(line => line.map(string => Logger.convertChatColors(string)))
    }
}