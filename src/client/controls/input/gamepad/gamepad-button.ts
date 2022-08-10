import ButtonAxle, {ButtonAxleConfig} from '../../interact/button-axle';
import GamepadListener from "./gamepad-listener";

export interface GamepadButtonConfig extends ButtonAxleConfig {
    buttonIndex: number
}

export default class GamepadButton extends ButtonAxle {
	public button: any;

    constructor(gamepad: GamepadListener, config: GamepadButtonConfig) {
        super(config);

        this.button = config.buttonIndex
        gamepad.on("button", (index, value) => {
            if(index === this.button) {
                this.keyPressed(value)
            }
        })
    }
}