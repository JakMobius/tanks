import KeyboardListener from "./keyboard-listener";
import {isMacOS} from "src/utils/meta-key-name";
import TriggerAxle, {TriggerAxleConfig} from "src/client/controls/interact/trigger-axle";

export interface ShortcutTriggerAxleConfig extends TriggerAxleConfig {
    triggerShortcut: string
}

export default class ShortcutTriggerAxle extends TriggerAxle {
    public key: string;
    public ctrlKey: boolean;
    public altKey: boolean;

    constructor(keyboard: KeyboardListener, config: ShortcutTriggerAxleConfig) {
        super(config)
        let parts = config.triggerShortcut.split("-")
        this.key = parts[parts.length - 1].toLowerCase()
        this.ctrlKey = parts.indexOf("Ctrl") !== -1
        this.altKey = parts.indexOf("Alt") !== -1

        const keydownHandler = (event: KeyboardEvent) => {
            if(this.modifierKeysMatch(event) && event.key.toLowerCase() === this.key) {
                event.preventDefault()
                this.trigger()
            }
        }

        const clearAxlesHandler = () => {
            keyboard.off("keydown", keydownHandler)
            keyboard.off("clear-axles", clearAxlesHandler)
            this.disconnectAll()
        }

        keyboard.on("keydown", keydownHandler)
        keyboard.on("clear-axles", clearAxlesHandler)
    }

    static isCtrlPressed(event: KeyboardEvent): boolean {
        return isMacOS ? event.metaKey : event.ctrlKey
    }

    modifierKeysMatch(event: KeyboardEvent): boolean {
        let requiredCtrlKey = this.ctrlKey || false
        let requiredAltKey = this.altKey || false

        return requiredCtrlKey === ShortcutTriggerAxle.isCtrlPressed(event) && requiredAltKey === event.altKey
    }
}