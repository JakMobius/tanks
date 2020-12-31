
import ButtonAxle from './buttonaxle';

class KeyAxle extends ButtonAxle {
	public key: any;

    constructor(keyboard, key, min, max) {
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

export default KeyAxle;