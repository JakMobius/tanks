export type LexemeType = "comment" | "newline" | "whitespace" | "string"
export type QuoteType = "'" | '"' | null

export class Lexeme {
    type: LexemeType
    rawContents: string

    constructor(type: LexemeType) {
        this.type = type
    }
}

export class CommentLexeme extends Lexeme {
    constructor() {
        super("comment");
    }

    contents: string = ""
}

export class NewlineLexeme extends Lexeme {
    constructor() {
        super("newline");
        this.rawContents = "\n"
    }
}

export class WhitespaceLexeme extends Lexeme {
    constructor() {
        super("whitespace");
    }

    contents: string = ""
}

export class StringLexeme extends Lexeme {
    constructor(quoteType: QuoteType) {
        super("string");
        this.quoteType = quoteType
    }

    contents: string = "";
    quoteType: QuoteType

    setQuoteType(type: QuoteType) {
        if(type == this.quoteType) return;

        if(this.quoteType) {
            if(!this.rawContents.endsWith(this.quoteType)) {
                this.rawContents = this.rawContents.substr(1, this.rawContents.length - 1)
            } else {
                this.rawContents = this.rawContents.substr(1, this.rawContents.length - 2)
            }
        } else if(type) {
            this.rawContents = this.contents.split("").map((c) => {
                if(Lexer.stringCharacterShouldBeEscaped(c, type)) return "\\" + c
                return c
            }).join("")
        }

        if(type) {
            this.rawContents = type + this.rawContents + type
        } else if(this.quoteType) {
            this.rawContents = this.rawContents.split("").map((c) => {
                if(Lexer.escapeStringContents(c, null)) return "\\" + c
                return c
            }).join("")
        }
        this.quoteType = type
    }
}

export default class Lexer {
    static shared = new Lexer()

    position = 0
    string: string
    result: Lexeme[]

    constructor() {
    }

    private next() { return this.string[this.position] }
    private eat() { this.position++ }

    reset() {
        this.position = 0
        this.result = []
        this.string = null
    }

    setString(string: string) {
        this.string = string
    }

    private addLexeme(lexeme: Lexeme) {
        this.result.push(lexeme)
    }

    parseGlobal(): Lexeme[] {
        let c = ""
        while ((c = this.next())) {
            if (Lexer.isQuote(c)) {
                this.addLexeme(this.parseString(c as QuoteType))
            } else if (Lexer.isWhitespace(c)) {
                this.addLexeme(this.parseWhitespace())
            } else if (Lexer.isNewline(c)) {
                this.addLexeme(this.parseNewline())
            } else if (Lexer.isComment(c)) {
                this.addLexeme(this.parseComment())
            } else {
                this.addLexeme(this.parseString(null))
            }
        }

        return this.result
    }

    parseComment() {
        let startPosition = this.position
        let lexeme = new WhitespaceLexeme()

        this.eat()

        while (true) {
            let c = this.next();
            if (Lexer.isNewline(c) || !c) {
                break;
            }
            this.eat()
            lexeme.contents += c
        }

        lexeme.rawContents = this.string.substring(startPosition, this.position)
        return lexeme
    }

    parseNewline() {
        let lexeme = new NewlineLexeme()
        this.eat()
        return lexeme
    }

    parseWhitespace() {
        let startPosition = this.position
        let lexeme = new WhitespaceLexeme()

        while (true) {
            let c = this.next();
            if (Lexer.isWhitespace(c)) {
                this.eat()
                lexeme.contents += c
            } else {
                break;
            }
        }

        lexeme.rawContents = this.string.substring(startPosition, this.position)
        return lexeme
    }

    parseString(type: QuoteType) {
        let startPosition = this.position
        let lexeme = new StringLexeme(type)
        let escaped = false

        if (Lexer.isQuote(type)) {
            this.eat();
        }

        while (true) {
            let c = this.next()
            if (!c) break;

            if (escaped) {
                lexeme.contents += c
                this.eat()
                escaped = false
                continue
            }

            if (c == "\\") {
                escaped = true
                this.eat()
                continue;
            }

            if (Lexer.isNewline(c)) break;

            if (type) {
                if (c == type) {
                    this.eat();
                    break;
                } else {
                    lexeme.contents += c
                    this.eat()
                }
            } else {
                if (Lexer.isWhitespace(c) || Lexer.isQuote(c) || Lexer.isComment(c)) {
                    break;
                } else {
                    lexeme.contents += c
                    this.eat()
                }
            }
        }

        lexeme.rawContents = this.string.substring(startPosition, this.position)
        return lexeme
    }


    private static isNewline(c?: string) {
        return c == "\n"
    }

    private static isQuote(c?: string) {
        return c == "\"" || c == "\'"
    }

    private static isWhitespace(c?: string) {
        return c == " " || c == "\t"
    }

    private static isComment(c?: string) {
        return c == "#";
    }

    static stringCharacterShouldBeEscaped(char: string, quote: QuoteType) {
        if(!quote) {
            if(this.isWhitespace(char) ||
                this.isNewline(char) ||
                this.isQuote(char) ||
                this.isComment(char) ||
                char == "\\") return true
        } else {
            if (this.isQuote(char)) {
                if (char == quote) return true
            }
            if(this.isNewline(char) || char == "\\") {
                return true
            }
        }
        return false
    }

    static adviceQuotesForString(contents: string) {
        for(let char of contents) {
            if(this.stringCharacterShouldBeEscaped(contents, null)) return true;
        }
        return false;
    }

    static escapeStringContents(contents: string, quote: QuoteType) {
        let result = ""
        if(quote) result += quote

        for(let char of contents) {
            if(this.stringCharacterShouldBeEscaped(char, quote)) {
                result += "\\"
            }
            result += char
        }

        if(quote) result += quote
        return result
    }
}

