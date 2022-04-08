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
}

export default class Lexer {
    static shared = new Lexer()

    position = 0
    string: string
    result: Lexeme[]

    constructor() {
    }

    private next() {
        return this.string[this.position]
    }

    private eat() {
        this.position++
    }

    getLexemes(line: string): Lexeme[] {
        this.string = line
        this.position = 0
        this.result = []
        let c = ""

        while ((c = this.next())) {
            if (this.isQuote(c)) {
                this.parseString(c as QuoteType)
            } else if (this.isWhitespace(c)) {
                this.parseWhitespace()
            } else if (this.isNewline(c)) {
                this.parseNewline()
            } else if (this.isComment(c)) {
                this.parseComment()
            } else {
                this.parseString(null)
            }
        }

        return this.result
    }

    private parseComment() {
        let startPosition = this.position
        let lexeme = new WhitespaceLexeme()

        this.eat()

        while (true) {
            let c = this.next();
            if (this.isNewline(c) || !c) {
                break;
            }
            this.eat()
            lexeme.contents += c
        }

        lexeme.rawContents = this.string.substring(startPosition, this.position)
        this.result.push(lexeme)
    }

    private parseNewline() {
        let lexeme = new NewlineLexeme()
        this.eat()
        this.result.push(lexeme)
    }

    private parseWhitespace() {
        let startPosition = this.position
        let lexeme = new WhitespaceLexeme()

        while (true) {
            let c = this.next();
            if (this.isWhitespace(c)) {
                this.eat()
                lexeme.contents += c
            } else {
                break;
            }
        }

        lexeme.rawContents = this.string.substring(startPosition, this.position)
        this.result.push(lexeme)
    }

    private parseString(type: QuoteType) {
        let startPosition = this.position
        let lexeme = new StringLexeme(type)
        let escaped = false

        if (this.isQuote(type)) {
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

            if (this.isNewline(c)) break;

            if (type) {
                if (c == type) {
                    this.eat();
                    break;
                } else {
                    lexeme.contents += c
                    this.eat()
                }
            } else {
                if (this.isWhitespace(c) || this.isQuote(c)) {
                    break;
                } else {
                    lexeme.contents += c
                    this.eat()
                }
            }
        }

        lexeme.rawContents = this.string.substring(startPosition, this.position)
        this.result.push(lexeme)
    }


    private isNewline(c?: string) {
        return c == "\n"
    }

    private isQuote(c?: string) {
        return c == "\"" || c == "\'"
    }

    private isWhitespace(c?: string) {
        return c == " " || c == "\t"
    }

    private isComment(c?: string) {
        return c == "#";
    }
}

