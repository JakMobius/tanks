import Logger from '../log/logger';
import * as fs from 'fs';
import CommandList from "../commands/types/%"
import Command from "../commands/command";
import Server from "../server";
import ConsoleWindow from "./console-window";
import Parser, {CommandASTNode, CommandParameterASTNode, CommentASTNode, GlobalASTNode} from "./language/parser";

import Serializer from "./language/serializer";
import Lexer, {StringLexeme} from "./language/lexer";
import Entity from "src/utils/ecs/entity";

export interface ConsoleAutocompleteOptions {
    /// Indicates whether only one completion unit is required
    single?: boolean
}

export default class Console {
    public observingRoom: Entity;
    public prompt: string | null;
    public tabCompleteIndex: number;
    public tabCompletions?: string[];
    public window: ConsoleWindow;
    public currentLogger: Logger;
    public commands = new Map<string, Command>();
    public server: Server = null
    public logger: Logger = null

    constructor() {
        this.server = null
        this.observingRoom = null
        this.prompt = null

        this.tabCompleteIndex = null
        this.tabCompletions = null

        this.logger = Logger.global

        this.loadCommands()
    }

    createWindow(): void {
        this.window = new ConsoleWindow()

        // Shift-tab feature doesn't work
        // in WebStorm internal console.

        this.window.on("input", () => this.updateAutosuggestion())
        this.window.on("input", () => this.tabCompleteClear())
        this.window.on("history-walk", () => {
            this.tabCompleteClear()
            this.window.suggest(null)
        })
        this.window.on("exit", 	() => this.commands.get("exit").onPerform([]))
        this.window.on("command", 	(command: string) => this.evaluate(command))

        this.window.on("tab", (shift) => {
            if (this.tabCompletions) {
                if(shift) this.tabCompletePrevious()
                else this.tabCompleteNext()
            } else {
                this.tabCompleteBegin(this.window.getValue(), shift)
            }
        })

        this.logger.addDestination(this.window.destination)
    }

    private getCommandByOffset(ast: GlobalASTNode, offset: number): CommandASTNode | null {
        let position = 0

        for(let eachCommand of ast.children) {
            if(eachCommand instanceof CommandASTNode) {
                if(position < offset && position + eachCommand.totalRawLength() >= offset) {
                    return eachCommand
                }
            }
            position += eachCommand.totalRawLength()
        }

        return null
    }

    // TODO: this is way too large and ugly
    private processCommandParameters(command: CommandASTNode, offset: number): string[] | null {
        let result = []
        let position = 0
        let insideOfParameter = false

        for(let i = 0; i < command.children.length; i++) {
            let child = command.children[i]

            if (position < offset) {
                if(child instanceof CommandParameterASTNode) {
                    let rightPosition = position + child.lexeme.rawContents.length
                    let raw = child.lexeme.rawContents

                    if(rightPosition >= offset) {
                        insideOfParameter = true
                        raw = raw.substring(0, raw.length - rightPosition + offset)
                        Lexer.shared.reset()
                        Lexer.shared.setString(raw)
                        let lexeme = Lexer.shared.parseString(child.lexeme.quoteType)
                        Lexer.shared.reset()

                        result.push(lexeme.contents)
                    } else {
                        result.push(raw)
                    }

                } else if(child instanceof CommentASTNode) {
                    return null
                }
            } else {
                child.removeFromParent()
                i--
            }
            position += child.totalRawLength()
        }

        if(!insideOfParameter) {
            result.push("")
        }

        return result
    }

    private lastCommandParameter(command: CommandASTNode) {
        let childrenCount = command.children.length

        if(childrenCount && command.children[childrenCount - 1] instanceof CommandParameterASTNode) {
            return command.children[childrenCount - 1] as CommandParameterASTNode
        } else {
            let lastParameter = new CommandParameterASTNode()
            lastParameter.lexeme = new StringLexeme(null)
            lastParameter.lexeme.contents = ""
            lastParameter.lexeme.rawContents = ""
            command.children.push(lastParameter)
            return lastParameter
        }
    }

    private getAutocompletes(args: string[], options: ConsoleAutocompleteOptions): string[] {

        if (args.length > 1) {
            let command = this.commands.get(args[0])
            if (!command) return null

            let completions = command.onTabComplete(args.slice(1), options)
            if (!completions) return null

            return completions
        }

        let completions = []
        for (let command of this.commands.values()) {
            let name = command.getName()

            if (args.length !== 0 && !name.startsWith(args[0])) continue;

            completions.push(name)
        }
        return completions
    }

    private autocompleteStringLexeme(lexeme: StringLexeme, line: string) {
        if(!line.startsWith(lexeme.contents)) {
            lexeme.contents = ""
            lexeme.rawContents = ""
            lexeme.setQuoteType(null)
        }

        let lexemeQuoteType = lexeme.quoteType
        let rawContents = lexeme.rawContents

        for(let i = lexeme.contents.length; i < line.length; i++) {
            let char = line[i]
            lexeme.contents += char;

            let escape = false
            while((escape = Lexer.stringCharacterShouldBeEscaped(char, lexemeQuoteType))) {
                if(lexemeQuoteType) break;
                lexemeQuoteType = "\""
                rawContents = lexemeQuoteType + rawContents
            }

            rawContents += escape ? "\\" + char : char
        }


        if(lexemeQuoteType) rawContents += lexemeQuoteType
        lexeme.rawContents = rawContents
        lexeme.setQuoteType(lexemeQuoteType)
    }

    tabCompleteBegin(line: string, shift: boolean): void {
        let cursorPosition = this.window.getCurrentCursorPosition()
        let ast = Parser.shared.parseGlobalSource(line)

        let commandNode = this.getCommandByOffset(ast, cursorPosition)
        if(!commandNode) return

        let args = this.processCommandParameters(commandNode, cursorPosition)
        if (!args) return

        this.tabCompletions = this.getAutocompletes(args, {
            single: false
        })

        if (this.tabCompletions && this.tabCompletions.length) {
            this.updateAutosuggestion()

            if(this.tabCompletions.length > 1) {
                this.logger.log(this.tabCompletions.join(", "))
            }

            let lastParameter = this.lastCommandParameter(commandNode)
            let originalQuoteType = lastParameter.lexeme.quoteType
            let originalRawContent = lastParameter.lexeme.rawContents
            let originalContent = lastParameter.lexeme.contents

            if(lastParameter) {
                this.tabCompletions = this.tabCompletions.map((completion: string) => {
                    lastParameter.lexeme.quoteType = originalQuoteType
                    lastParameter.lexeme.rawContents = originalRawContent
                    lastParameter.lexeme.contents = originalContent
                    this.autocompleteStringLexeme(lastParameter.lexeme, completion)
                    return Serializer.shared.serialize(commandNode)
                })

                if (this.tabCompletions.length > 1) {
                    if (shift) {
                        this.tabCompleteIndex = this.tabCompletions.length
                        this.tabCompletePrevious()
                    } else {
                        this.tabCompleteIndex = -1
                        this.tabCompleteNext()
                    }
                    return
                }

                this.setConsoleLine(this.tabCompletions[0])
            }
        }

        this.tabCompletions = null
    }

    tabCompletePrevious(): void {
        this.tabCompleteIndex--
        if(this.tabCompleteIndex < 0) this.tabCompleteIndex = this.tabCompletions.length - 1;
        this.setConsoleLine(this.tabCompletions[this.tabCompleteIndex])
    }

    tabCompleteNext(): void {
        this.tabCompleteIndex++
        if(this.tabCompleteIndex >= this.tabCompletions.length) {
            this.tabCompleteIndex = 0
        }
        this.setConsoleLine(this.tabCompletions[this.tabCompleteIndex])
    }

    setConsoleLine(text: string) {
        this.window.setLine(text)
        this.window.setCursorPosition(text.length)
    }

    tabCompleteClear(): void {
        this.tabCompletions = null
        this.tabCompleteIndex = null
    }

    updateAutosuggestion(): void {

        if(this.tabCompletions) {
            this.window.suggest(null)
            return
        }

        let cursorPosition = this.window.getCurrentCursorPosition()
        let line = this.window.getValue()

        if(line.length == 0 || cursorPosition != line.length) {
            this.window.suggest(null)
            return
        }

        let ast = Parser.shared.parseGlobalSource(line)

        let commandNode = this.getCommandByOffset(ast, cursorPosition)
        if(!commandNode) return

        let args = this.processCommandParameters(commandNode, cursorPosition)
        if (!args) return

        let completions = this.getAutocompletes(args, {
            single: true
        })

        if(completions && completions.length == 1) {

            let lastParameter = this.lastCommandParameter(commandNode)

            if(lastParameter) {
                let originalParameter = lastParameter.lexeme.rawContents
                let originalQuote = lastParameter.lexeme.quoteType ?? ""
                this.autocompleteStringLexeme(lastParameter.lexeme, completions[0])

                let newQuote = lastParameter.lexeme.quoteType ?? ""
                let suggestion = lastParameter.lexeme.rawContents

                if(originalQuote != newQuote) {
                    suggestion = suggestion.substr(originalParameter.length + newQuote.length - originalQuote.length)

                    this.window.suggest([{
                        suggestion: newQuote,
                        replace: originalQuote.length > 0,
                        position: line.length - originalParameter.length
                    }, {
                        suggestion: suggestion
                    }])
                } else {
                    suggestion = suggestion.substr(originalParameter.length)

                    this.window.suggest([{
                        suggestion: suggestion
                    }])
                }

                return;
            }
        }

        this.window.suggest(null)
    }

    evaluate(line: string): Promise<boolean> {
        console.log(this.window.getFullPrompt() + line)
        line = line.trim()

        if(line.length === 0) return Promise.resolve(true)

        let ast = Parser.shared.parseGlobalSource(line)

        for(let children of ast.children) {
            if(!(children instanceof CommandASTNode)) continue;

            let parameters = children.getParameters()

            if (!parameters.length || parameters[0].length === 0) return Promise.resolve(true)

            let handle = this.commands.get(parameters[0])

            if (handle) {
                return this.callHandle(handle, parameters.slice(1))
            } else {
                this.logger.log("§F00;Unknown command: '" + parameters[0] + "'")
                return Promise.resolve(false)
            }
        }

        return Promise.resolve(true)
    }

    callHandle(handle: Command, args: string[]): Promise<boolean> {
        if (handle.requiresRoom() && !this.observingRoom) {
            this.logger.log("§F00;You should enter a room to execute this command")
            return Promise.resolve(false)
        } else {
            let result = handle.onPerform(args)
            if(typeof result === "boolean") return Promise.resolve(result)
            return result
        }
    }

    switchToLogger(logger: Logger) {
        if(this.currentLogger) {
            this.currentLogger.removeDestination(this.logger)
        }
        logger.addDestination(this.logger)
        this.currentLogger = logger
    }

    async runScript(name: string, index: number = 0) {
        const file = this.server.getResourcePath("scripts/" + name + ".script")

        if(!fs.existsSync(file)) {
            this.logger.log("§F00;Could not find script named '" + name + "'.")
            return false
        }

        let result = true
        const commands = fs.readFileSync(file, 'utf8').split("\n")
        for(let i = index; i < commands.length; i++) {
            const command = commands[i]
            result = await this.evaluate(command)
        }

        return result
    }

    loadCommands() {
        for(let constructor of Object.values(CommandList)) {
            let command = new (constructor as typeof Command)({
                console: this
            })
            this.commands.set(command.getName(), command);
        }
    }

    destroy() {
        if(this.window) this.window.destroy()
    }
}

