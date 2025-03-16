import KeyAxle, {KeyAxleConfig} from './key-axle';
import InputDevice, {InputDeviceType} from "../input-device";
import KeyboardListener from "./keyboard-listener";
import ShortcutTriggerAxle, {ShortcutTriggerAxleConfig} from "./shortcut-trigger-axle";

export enum KeyboardInputType {
    key,
    shortcutTrigger
}

export type KeyboardInputConfig =
    (KeyAxleConfig & { type: KeyboardInputType.key }) |
    (ShortcutTriggerAxleConfig & { type: KeyboardInputType.shortcutTrigger });

export default class KeyboardController extends InputDevice {
    listener: KeyboardListener;

    metaKeyPressed: boolean = false
    ctrlKeyPressed: boolean = false
    shiftKeyPressed: boolean = false

    constructor() {
        super()
        this.listener = new KeyboardListener()
        this.listener.setTarget(document.body)

        this.listener.on("keydown", (e) => {
            if(e.metaKey) this.metaKeyPressed = true
            if(e.ctrlKey) this.ctrlKeyPressed = true
            if(e.shiftKey) this.shiftKeyPressed = true
        })

        this.listener.on("keyup", (e) => {
            if(!e.metaKey) this.metaKeyPressed = false
            if(!e.ctrlKey) this.ctrlKeyPressed = false
            if(!e.shiftKey) this.shiftKeyPressed = false
        })
    }

    getType(): InputDeviceType {
        return InputDeviceType.keyboard
    }

    getName(): string {
        return "Keyboard"
    }

    createAxle(config: KeyboardInputConfig) {
        if(config.type === KeyboardInputType.key) {
            return new KeyAxle(this.listener, config)
        } else {
            return new ShortcutTriggerAxle(this.listener, config)
        }
    }

    clearAxles() {
        this.listener.clearAxles()
    }
}