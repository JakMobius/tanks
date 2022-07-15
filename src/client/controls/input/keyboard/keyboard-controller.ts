
import KeyAxle, {KeyAxleConfig} from './key-axle';
import InputDevice, {InputDeviceType} from "../input-device";
import KeyboardListener from "./keyboard-listener";

export default class KeyboardController extends InputDevice {
    private listener: KeyboardListener;

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

    createAxle(config: KeyAxleConfig) {
        return new KeyAxle(this.listener, config)
    }
}