import ButtonAxle from './button-axle';
import KeyboardController from "./interact/keyboard-controller";

export default class KeyAxle extends ButtonAxle {
	public key: any;

    constructor(keyboard: KeyboardController, key: string, min: number, max: number) {
        super(min, max)
        this.key = key

        keyboard.on("keydown", (event) => {
            if(event.code === this.key) this.keyPressed()
        })
        keyboard.on("keyup", (event) => {
            if(event.code === this.key) this.keyReleased()
        })
    }
}