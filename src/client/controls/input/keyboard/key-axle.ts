import ButtonAxle, {ButtonAxleConfig} from '../../interact/button-axle';
import KeyboardController from "./keyboard-controller";
import KeyboardListener from "./keyboard-listener";

export interface KeyAxleConfig extends ButtonAxleConfig {
    key: string
}

export default class KeyAxle extends ButtonAxle {
	public key: string;

    constructor(keyboard: KeyboardListener, config: KeyAxleConfig) {
        super(config)
        this.key = config.key

        keyboard.on("stopped-listening", () => {
            this.keyReleased();
        })
        keyboard.on("keydown", (event) => {
            if(event.code === this.key) this.keyPressed()
        })
        keyboard.on("keyup", (event) => {
            if(event.code === this.key) this.keyReleased()
        })
    }
}