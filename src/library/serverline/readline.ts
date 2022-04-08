import * as readline from "readline";
import {Keypress} from "./index";

export interface Readline extends readline.Interface {
    _prompt: string
    columns: number
    rows: number
    _refreshLine(): void
    _ttyWrite(key: string, keypress: Keypress): void
    _moveCursor(position: number): void
}

export function createReadline(options: readline.ReadLineOptions): Readline {
    const rl = readline.createInterface(options)
    return rl as any as Readline
}
