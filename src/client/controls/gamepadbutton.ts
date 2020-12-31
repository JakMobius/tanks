
import ButtonAxle from './buttonaxle';

class GamepadButton extends ButtonAxle {
	public button: any;

    constructor(gamepad, button, min?, max?) {
        super(max, min);

        this.button = button
        gamepad.on("button", (index, value) => {
            if(index === this.button) {
                this.keyPressed(value)
            }
        })
    }
}

export default GamepadButton;