
const util = require("util")
const Chalk = require("chalk")

class Entry {
    constructor(title) {
        this.title = title
        this.date = Date.now()
        this.hasInlinedText = false
    }
}

class Timings {
    static stdoutWriteHandler = null
    static stderrWriteHandler = null

    static stdoutShouldLinefeed = false
    static stdoutMarkMessage = false

    static logPrefix = Chalk.yellow.bold("[ LOG ]") + Chalk.gray(": ")
    static errPrefix = Chalk.red.bold("[ ERR ]") + Chalk.gray(": ")

    static timingColor = Chalk.cyan

    static stack = []

    static tab() {
        return new Array(this.stack.length + 1).join(Chalk.gray("- "))
    }

    static begin(title) {
        this.stdoutMarkMessage = false

        process.stdout.write(title + Chalk.gray(":"))

        this.stdoutMarkMessage = true
        this.stdoutShouldLinefeed = true

        if(this.stack.length === 0) {
            this.bindStdout();
        }

        this.stack.push(new Entry(title))
    }

    static perform(title, task) {
        this.begin(title)

        if(util.types.isAsyncFunction(task)) {
            return task().then(() => this.end())
        }

        task()
        this.end()
    }

    static end() {
        let task = this.stack.pop()

        let time = ((Date.now() - task.date) / 1000).toFixed(3)

        this.stdoutMarkMessage = false

        if (task.hasInlinedText) {
            process.stdout.write(task.title + Chalk.gray(": ") + this.timingColor("[" + time + "s]"))
            this.stdoutShouldLinefeed = true
        } else {
            this.stdoutShouldLinefeed = false
            process.stdout.write(this.timingColor(" [" + time + "s]"))
            this.stdoutShouldLinefeed = true
        }

        this.stdoutMarkMessage = true

        if(this.stack.length === 0) {
            this.unbindStdout();
        }
    }

    static bindStdout() {
        this.stdoutWriteHandler = process.stdout.write
        this.stderrWriteHandler = process.stderr.write

        process.stdout.write = (data) => {
            this.writeHandler(data, false)
        }

        process.stderr.write = (data) => {
            this.writeHandler(data, true)
        }
    }

    static writeHandler(text, isError) {
        if(this.stack.length)
            this.stack[this.stack.length - 1].hasInlinedText = true

        if (this.stdoutShouldLinefeed) {
            text = "\n" + text;
            this.stdoutShouldLinefeed = false;
        } else if(this.stdoutMarkMessage) {
            if (isError) text = this.errPrefix + text;
            else         text = this.logPrefix + text;
        }

        if(text[text.length - 1] === "\n") {
            text = text.substr(0, text.length - 1)
            this.stdoutShouldLinefeed = true
        }

        if(this.stdoutMarkMessage) {
            text = text.replace(/\n(?!$)/g, "\n" + this.tab() + (isError ? this.errPrefix : this.logPrefix));
        } else {
            text = text.replace(/\n/g, "\n" + this.tab());
        }

        this.stdoutWriteHandler.call(process.stdout, text);
    }

    static unbindStdout() {
        process.stdout.write = this.stdoutWriteHandler
    }
}

module.exports = Timings