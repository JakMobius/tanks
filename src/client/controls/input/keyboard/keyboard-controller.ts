
import KeyAxle, {KeyAxleConfig} from './key-axle';
import InputDevice, {InputDeviceType} from "../input-device";
import KeyboardListener from "./keyboard-listener";
import ShortcutTriggerAxle, {ShortcutTriggerAxleConfig} from "./shortcut-trigger-axle";

export enum KeyboardInputType {
    key, shortcutTrigger
}

export type KeyboardInputConfig =
    (KeyAxleConfig & { type: KeyboardInputType.key }) |
    (ShortcutTriggerAxleConfig & { type: KeyboardInputType.shortcutTrigger });

export default class KeyboardController extends InputDevice {
    listener: KeyboardListener;

    constructor() {
        super()
        this.listener = new KeyboardListener()
        this.listener.startListening()
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