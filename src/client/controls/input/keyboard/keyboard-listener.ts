import DocumentEventHandler from "../../interact/document-event-handler";
import {isMacOS} from "../../../../utils/meta-key-name";

export default class KeyboardListener extends DocumentEventHandler {

    constructor() {
        super();
        this.keys = new Set()
    }

    keyup(e: KeyboardEvent) {
        this.emit("keyup", e)
        this.keys.delete(e.code)
    }

    keydown(e: KeyboardEvent) {
        if(e.repeat) {
            e.preventDefault()
            return
        }
        this.emit("keydown", e)
        this.keys.add(e.code)
    }

    onKeybinding(name: string, handler: (event: KeyboardEvent) => void) {
        let parts = name.split("-")
        let cmd = parts.indexOf("Cmd") !== -1
        let shift = parts.indexOf("Shift") !== -1
        let alt = parts.indexOf("Alt") !== -1
        let key = parts.pop()

        this.on("keydown", (event: KeyboardEvent) => {
            let eventCmd = isMacOS ? event.metaKey : event.ctrlKey
            let eventShift = event.shiftKey
            let eventAlt = event.altKey

            let eventKey = event.code
            if (eventKey.startsWith("Key")) eventKey = eventKey.substr(3)

            if (eventCmd !== cmd) return;
            if (eventShift !== shift) return;
            if (eventAlt !== alt) return;
            if (eventKey !== key) return;

            event.preventDefault()

            handler(event)
        })
    }

    startListening() {
        this.bind("keyup", this.keyup)
        this.bind("keydown", this.keydown)
    }

    stopListening() {
        super.stopListening();
        this.emit("stopped-listening")
    }

    clearAxles() {
        this.emit("clear-axles")
    }
}