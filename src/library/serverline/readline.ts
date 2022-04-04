import * as readline from "readline";

export interface Readline extends readline.Interface {
    history: string[]
    _prompt: string
    columns: number
    _refreshLine(): void
}

export function createReadline(options: readline.ReadLineOptions): Readline {
    const rl = readline.createInterface(options)
    return rl as any as Readline
}
