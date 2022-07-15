import ButtonAxle from '../../interact/button-axle';
import GamepadController from "./gamepad-controller";

export default class GamepadButton extends ButtonAxle {
	public button: any;

    constructor(gamepad: GamepadController, button: number, min?: number, max?: number) {
        super(min, max);

        this.button = button
        gamepad.on("button", (index, value) => {
            if(index === this.button) {
                this.keyPressed(value)
            }
        })
    }
}