
import stream from 'stream'
import {createReadline, Readline} from "./readline";
import EventEmitter from "../../utils/event-emitter";

export interface ServerLineOptions {
    prompt?: string
    forceTerminalContext?: boolean
    consoleOptions: NodeJS.ConsoleConstructorOptions
}

export default class ServerLine extends EventEmitter {
    readline?: Readline = null
    promptString = '> '
    collection: {
        stdout?: stream.Writable,
        stderr?: stream.Writable
    } = {
        stdout: null,
        stderr: null
    }
    private originalConsole?: Console;

    getPrompt() {
        return this.promptString
    }

    setPrompt(strPrompt: string) {
        this.promptString = strPrompt
        this.readline.setPrompt(this.promptString)
    }

    getHistory() {
        return (this.readline.terminal) ? this.readline.history : []
    }

    setHistory(history: string[]) {
        if (this.readline.terminal && Array.isArray(history)) {
            this.readline.history = history
            return true
        }
        return !!this.readline.terminal
    }

    getReadline() {
        return this.readline
    }

    close() {
        this.collection.stdout = null
        this.collection.stderr = null
        this.readline.close()
        this.readline = null
        this.collection = null
        console = this.originalConsole
        this.originalConsole = null
    }

    pause() {
        this.readline.pause()
    }

    resume() {
        this.readline.resume()
    }

    private beforeTheLastLine(chunk: any) {
        const nbline = Math.ceil((this.readline.line.length + this.readline._prompt.length + 1) / this.readline.columns)

        let text = ''
        text += '\n\r\x1B[' + nbline + 'A\x1B[0J'
        text += chunk.toString()
        text += Array(nbline).join('\n')

        return Buffer.from(text, 'utf8')
    }

    init(options?: ServerLineOptions) {
        options = Object.assign({
            prompt: '> ',
            forceTerminalContext: false
        }, options)

        if (options.forceTerminalContext) {
            process.stdin.isTTY = true
            process.stdout.isTTY = true
        }

        this.readline = createReadline({
            input: process.stdin,
            output: process.stdout,
            completer: (line: string) => this.completer(line),
            prompt: options.prompt
        })

        if (!this.readline.terminal) {
            console.warn('WARN: Compatibility mode! The current context is not a terminal. This may ' +
                'occur when you redirect terminal output into a file.')
            console.warn('You can try to define `options.forceTerminalContext = true`.')
        }

        this.consoleOverwrite(options.consoleOptions)

        this.readline.on('line', (line) => {
            if (this.readline.history && this.readline.terminal) {
                this.readline.history.push(line)
            }
            this.emit('line', line)
            if (this.readline.terminal) {
                this.readline.prompt()
            }
        })
        this.readline.on('SIGINT', () => {
            this.setLine("")
            this.emit('SIGINT', this.readline)
        })
        this.readline.prompt()
    }

    setLine(line: string) {
        if (this.readline.terminal) {
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
            if (this.readline.terminal) {
                original.write(this.beforeTheLastLine(chunk), encoding, () => {
                    this.readline._refreshLine()
                    callback()
                })
            } else {
                original.write(chunk, encoding, callback)
            }
        }
    }

    private consoleOverwrite(options: NodeJS.ConsoleConstructorOptions) {
        this.collection.stderr = new stream.Writable()
        this.collection.stdout = new stream.Writable()

        this.overwriteStream(this.collection.stdout, process.stdout)
        this.overwriteStream(this.collection.stderr, process.stderr)

        const Console = console.Console
        const consoleOptions = Object.assign({}, {
            stdout: this.collection.stdout,
            stderr: this.collection.stderr
        }, options)
        this.originalConsole = console
        console = new Console(consoleOptions)
        console.Console = Console
    }

    private completer(line: string) {
        this.emit('completer', line)
    }
}
