import readline, {Interface} from "readline";
import {Keypress} from "./index";

let rawReadlineInterface: Interface | null = null
let listenerCount: number = 0

function openInterface() {
    process.stdin.setRawMode(true);
    rawReadlineInterface = readline.createInterface({input: process.stdin, escapeCodeTimeout: 50});
    readline.emitKeypressEvents(process.stdin, rawReadlineInterface)
}

function closeInterface() {
    process.stdin.setRawMode(false);
    rawReadlineInterface.close()
}

export function addListener(listener: (d: string, key: Keypress) => void) {
    if(listenerCount == 0) {
        openInterface()
    }
    process.stdin.on("keypress", listener)
    listenerCount++
}

export function removeListener(listener: (d: string, key: Keypress) => void) {
    process.stdin.off("keypress", listener)
    listenerCount--
    if(listenerCount == 0) {
        closeInterface()
    }
}