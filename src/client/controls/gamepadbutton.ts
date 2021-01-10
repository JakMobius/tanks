
import ButtonAxle from './buttonaxle';
import GamepadManager from "./interact/gamepadmanager";

class GamepadButton extends ButtonAxle {
	public button: any;

    constructor(gamepad: GamepadManager, button: number, min?: number, max?: number) {
        super(min, max);

        this.button = button
        gamepad.on("button", (index, value) => {
            if(index === this.button) {
                this.keyPressed(value)
            }
        })
    }
}

export default GamepadButton;