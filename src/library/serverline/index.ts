import stream from 'stream'
import {createReadline, Readline} from "./readline";
import EventEmitter from "src/utils/event-emitter";
import * as KeypressListener from "./keypress-listener";
import * as readline from "readline";
import chalk from "chalk";

export interface ServerLineOptions {
    prompt?: string
    consoleOptions: NodeJS.ConsoleConstructorOptions
}

export interface Keypress {
    sequence: string,
    name: string,
    ctrl: boolean,
    meta: boolean,
    shift: boolean
}

export interface Suggestion {
    position?: number
    replace?: boolean
    suggestion: string
}

export interface ServerLineCollection {
    stdout?: stream.Writable,
    stderr?: stream.Writable,
    stdin?: stream.Readable
}

export default class ServerLine extends EventEmitter {
    readline?: Readline = null
    promptString = '> '
    collection: ServerLineCollection = {
        stdout: null,
        stderr: null,
        stdin: null
    }

    private originalConsole?: Console;
    private keypressListener?: (key: string, keypress: Keypress) => void
    private sigintListener?: () => void
    private suggestions: Suggestion[] = []

    constructor(options?: ServerLineOptions) {
        super()
        options = Object.assign({}, options)

        this.createInput();

        this.readline = createReadline({
            input: this.collection.stdin,
            output: process.stdout,
            prompt: options.prompt ?? '> '
        })

        this.keypressListener = (key: string, keypress: Keypress) => this.onKeypress(key, keypress)
        this.sigintListener = () => this.onExit()
        this.readline.on('SIGINT', this.sigintListener)
        this.consoleOverwrite(options.consoleOptions)

        if (!this.readline.terminal) {
            console.warn("Warning: output is not a terminal. ")
            return
        }

        KeypressListener.addListener(this.keypressListener)

        this.readline.prompt()
    }

    getPrompt() {
        return this.promptString
    }

    setPrompt(strPrompt: string) {
        if(strPrompt.length) {
            strPrompt += " "
        }
        this.promptString = strPrompt + '$ '
        this.readline.setPrompt(this.promptString)
    }

    close() {
        if(!this.readline) return

        this.readline.close()
        this.readline = null
        this.collection = null
        // console = this.originalConsole
        this.originalConsole = null

        if(this.readline.terminal) {
            KeypressListener.removeListener(this.keypressListener)
        }
    }

    private beforeTheLastLine(chunk: any) {
        const nbline = Math.ceil((this.readline.line.length + this.readline._prompt.length + 1) / this.readline.columns)

        let text = ''
        text += '\n\r\x1B[' + nbline + 'A\x1B[0J'
        text += chunk.toString()
        text += Array(nbline).join('\n')

        return Buffer.from(text, 'utf8')
    }

    setLine(line: string) {
        if(this.readline && this.readline.terminal) {
            (this.readline as any).line = line
            this.readline._refreshLine()
        }
    }

    getLine() {
        if (this.readline.terminal) {
            return this.readline.line
        }
        return ""
    }

    private overwriteStream(stream: stream.Writable, original: stream.Writable) {
        stream._write = (chunk, encoding, callback) => {
            // https://github.com/nodejs/node/blob/v10.0.0/lib/readline.js#L178
            if (this.readline && this.readline.terminal) {
                original.write(this.beforeTheLastLine(chunk), encoding, () => {
                    if(this.readline) {
                        this.readline._refreshLine()
                    }
                    callback()
                })
            } else {
                original.write(chunk, encoding, callback)
            }
        }
    }

    private createInput() {
        this.collection.stdin = new stream.Readable()
        this.collection.stdin._read = (size) => {
            if(this.readline) {
                process.stdin.read(size)
            }
        }
    }

    private consoleOverwrite(options: NodeJS.ConsoleConstructorOptions) {
        this.collection.stderr = new stream.Writable()
        this.collection.stdout = new stream.Writable()

        this.overwriteStream(this.collection.stdout, process.stdout)
        this.overwriteStream(this.collection.stderr, process.stderr)

        const originalRefreshLine = this.readline._refreshLine
        this.readline._refreshLine = () => {
            originalRefreshLine.call(this.readline)
            this.updateSuggestion()
        }

        const Console = console.Console
        const consoleOptions = Object.assign({}, {
            stdout: this.collection.stdout,
            stderr: this.collection.stderr
        }, options)
        this.originalConsole = console
        console = new Console(consoleOptions)
        console.Console = Console
    }

    private onKeypress(key: string, keypress: Keypress) {
        if(this.emit("keypress", keypress)) {
            this.readline.write(key, keypress)
            this.emit("after-keypress", keypress)
        }
    }

    private onExit() {
        this.emit("exit")
        this.setLine("")
    }

    getCursorPosition() {
        return this.readline.getCursorPos().cols - this.promptString.length
    }

    setCursorPosition(position: number) {
        this.readline._moveCursor(position - this.getCursorPosition())
    }

    suggest(suggestions?: Suggestion[]) {
        if(!suggestions) this.suggestions = []
        else this.suggestions = suggestions.sort((a, b) => a.position - b.position)
        this.readline._refreshLine()
    }

    private updateSuggestion() {
        let line = this.getLine()
        let start = 0

        let oldPosition = this.getCursorPosition()
        let unmodifiedPosition = oldPosition
        readline.moveCursor(process.stdout, -oldPosition, 0)

        let currentPosition = 0

        for(let i = 0; i < this.suggestions.length; i++) {
            let suggestion = this.suggestions[i]
            let end = suggestion.position ?? line.length

            process.stdout.write(line.substring(start, end))
            process.stdout.write(chalk.gray(suggestion.suggestion))

            currentPosition += end - start + suggestion.suggestion.length

            if(suggestion.replace) {
                start = end + suggestion.suggestion.length
            } else {
                start = end
                if(suggestion.position < oldPosition) {
                    oldPosition += suggestion.suggestion.length
                }
            }
        }

        readline.moveCursor(process.stdout, oldPosition - currentPosition, 0);
        (this.readline as any).cursor = unmodifiedPosition
    }
}
