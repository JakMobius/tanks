
import ButtonAxle from './buttonaxle';
import KeyboardController from "./interact/keyboardcontroller";

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