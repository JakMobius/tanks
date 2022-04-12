import Lexer, {CommentLexeme, Lexeme, NewlineLexeme, StringLexeme, WhitespaceLexeme} from "./lexer";
import Serializer from "./serializer";

export abstract class ASTNode {
    children: ASTNode[] = []
    parent?: ASTNode
    length?: number = null

    totalRawLength() {
        if(this.length !== null) {
            return this.length
        }
        let result = 0
        for(let child of this.children) {
            result += child.totalRawLength()
        }
        return result
    }

    serialize(serializer: Serializer) {
        for(let child of this.children) {
            child.serialize(serializer)
        }
    }

    private invalidateCaches() {
        this.length = null
    }

    appendChild(child: ASTNode) {
        this.children.push(child)
        child.parent = this
    }

    removeFromParent() {
        if(!this.parent) return
        let index = this.parent.children.indexOf(this)
        if(index < 0) return;
        this.parent.invalidateCaches()
        this.parent.children.splice(index, 1);
        this.parent = null
    }
}

export class GlobalASTNode extends ASTNode {

}

export class CommandASTNode extends ASTNode {
    getParameters(): string[] {
        let result: string[] = []

        for(let child of this.children) {
            if(!(child instanceof CommandParameterASTNode)) continue;
            result.push(child.lexeme.contents)
        }

        return result
    }
}

export class LexemeHolderASTNode<T extends Lexeme> extends ASTNode {
    lexeme: T
    totalRawLength() { return this.lexeme.rawContents.length }
    serialize(serializer: Serializer) { serializer.result += this.lexeme.rawContents; }
}

export class CommandParameterASTNode extends LexemeHolderASTNode<StringLexeme> {

}

export class CommentASTNode extends LexemeHolderASTNode<CommentLexeme>  {

}

export class WhitespaceASTNode extends LexemeHolderASTNode<WhitespaceLexeme> {

}

export class NewlineASTNode extends LexemeHolderASTNode<NewlineLexeme> {

}

export default class Parser {
    static shared = new Parser()

    position = 0
    lexemes: Lexeme[]

    // TODO: wrap in a structure
    astStack: ASTNode[]
    astPositionStack: number[]

    constructor() {}

    private next() { return this.lexemes[this.position] }
    private eat() { this.position++ }

    private nextReasonable() {
        while(true) {
            let next = this.lexemes[this.position]
            if(!next) return next
            if(next.type == "comment") {
                this.topNode().appendChild(this.parseComment())
            } else if(next.type == "whitespace") {
                this.topNode().appendChild(this.parseWhitespace())
            } else {
                return next
            }
        }
    }

    private pushNode<T extends ASTNode>(node: T) {
        this.astStack.push(node)
        this.astPositionStack.push(this.position)
        return node
    }

    private topNode() {
        return this.astStack[this.astStack.length - 1]
    }

    private revertNode() {
        this.position = this.astPositionStack[this.astPositionStack.length - 1]

        this.astPositionStack.pop()
        this.astStack.pop()
    }

    private completeNode<T extends ASTNode>(node: T): T {
        if(this.topNode() != node) {
            this.error("Parser stack misalignment")
        }
        this.astStack.pop()
        return node
    }

    parseNewline() {
        let result = this.pushNode(new NewlineASTNode());

        if(this.next().type != "newline") {
            this.revertNode()
            return null
        }

        result.lexeme = this.next() as NewlineLexeme;
        this.eat()

        return this.completeNode(result)
    }

    parseComment() {
        let result = this.pushNode(new CommentASTNode())

        if(this.next().type != "comment") {
            this.revertNode()
            return null
        }

        result.lexeme = this.next() as CommentLexeme;
        this.eat()

        return this.completeNode(result)
    }

    parseWhitespace() {
        let result = this.pushNode(new WhitespaceASTNode())

        if(this.next().type != "whitespace") {
            this.revertNode()
            return null
        }

        result.lexeme = this.next() as WhitespaceLexeme;
        this.eat()

        return this.completeNode(result)
    }

    parseArgument(): CommandParameterASTNode {
        let result = this.pushNode(new CommandParameterASTNode())

        if(this.next().type != "string") {
            this.revertNode()
            return null
        }

        result.lexeme = this.next() as StringLexeme;
        this.eat()

        return this.completeNode(result)
    }

    parseCommand(): CommandASTNode {
        let result = this.pushNode(new CommandASTNode())

        let c: Lexeme | null = null
        while((c = this.nextReasonable())) {
            result.appendChild(this.parseArgument());
        }

        return this.completeNode(result);
    }

    parseGlobal(): GlobalASTNode {
        let result = this.pushNode(new GlobalASTNode())

        let c: Lexeme | null = null
        while((c = this.nextReasonable())) {
            let command = this.parseCommand();
            if(!command) this.error("Expected command")
            result.appendChild(command)

            let next = this.nextReasonable()
            if(!next) {
                break
            } else {
                let newline = this.parseNewline();
                if(!newline) {
                    this.error("Expected newline or EOF after command")
                }
                result.appendChild(newline)
            }
        }

        return this.completeNode(result)
    }

    error(string: string) {
        throw new Error("Parser error at position " + this.position + ": " + string)
    }

    reset() {
        this.lexemes = []
        this.position = 0
        this.astStack = []
        this.astPositionStack = []
    }

    setLexemes(lexemes: Lexeme[]) {
        this.lexemes = lexemes
    }

    parseGlobalSource(text: string) {
        this.reset()

        Lexer.shared.reset()
        Lexer.shared.setString(text)
        this.setLexemes(Lexer.shared.parseGlobal())

        let result = this.parseGlobal()

        Lexer.shared.reset()
        this.reset()

        return result
    }
}