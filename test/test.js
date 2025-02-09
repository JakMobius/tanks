import chalk from 'chalk';
import { describe, it } from 'mocha';
import assert from 'assert';

function consoleStringWidth(text) {
    let length = text.length;
    let width = 0;
    for (let i = 0; i < length; i++) {
        if (text[i] == '\x1b' && text[i + 1] == '[') {
            let oldI = i++;
            let code = 0;
            do {
                code = text.charCodeAt(++i);
            } while ((code >= 48 && code <= 57) || code == 59);
            if (text[i] != 'm')
                i = oldI;
        }
        width++;
    }
    return width;
}

describe("consoleStringWidth", () => {
    it("should output string length for simple strings", () => {
        assert.strictEqual(consoleStringWidth("123"), 3);
    });
    it("should ignore chalk colors", () => {
        assert.strictEqual(consoleStringWidth(chalk.red("123")), 3);
        assert.strictEqual(consoleStringWidth(chalk.gray("$ ")), 2);
    });
    it("should handle strings with unicode symbols", () => {
        assert.strictEqual(consoleStringWidth("😊"), 2);
        assert.strictEqual(consoleStringWidth("你好"), 2);
    });
    it("should handle mixed strings with unicode and ASCII characters", () => {
        assert.strictEqual(consoleStringWidth("Hello 😊"), 8); // 5 (Hello) + 1 (space) + 2 (emoji)
        assert.strictEqual(consoleStringWidth("你好"), 2);
        assert.strictEqual(consoleStringWidth("你好 123 😊"), 9); // 2 (你好) + 1 (space) + 3 (123) + 1 (space) + 2 (emoji)
    });
});
//# sourceMappingURL=test.js.map
