import GamepadAxle, {GamepadAxleConfig} from './gamepad-axle';
import GamepadButton, {GamepadButtonConfig} from './gamepad-button';
import GamepadListener from "./gamepad-listener";
import InputDevice, {InputDeviceType} from "../input-device";
import Axle from "src/controls/axle";

export enum GamepadInputType {
    button, axle
}

export type GamepadInputConfig =
    (GamepadButtonConfig & { type: GamepadInputType.button }) |
    (GamepadAxleConfig   & { type: GamepadInputType.axle });

export default class GamepadController extends InputDevice {
	public listener: GamepadListener

    constructor(gamepadIndex: number) {
        super();
        this.listener = new GamepadListener(gamepadIndex)
    }

    createAxle(config: GamepadInputConfig): Axle | null {
        if(config.type === GamepadInputType.button) {
            return new GamepadButton(this.listener, config)
        } else if(config.type == GamepadInputType.axle) {
            return new GamepadAxle(this.listener, config)
        } else {
            return null
        }
    }

    clearAxles(): void {
        this.listener.emit("clear-axles")
    }

    getName(): string {
        return navigator.getGamepads()[this.listener.gamepadIndex].id;
    }

    getType(): InputDeviceType {
        return InputDeviceType.gamepad;
    }

    refresh() {
        this.listener.refresh();
    }
}