import Axle from '../../../../controls/axle';
import {AxleConfig} from "../input-device";
import GamepadListener from "./gamepad-listener";

export interface GamepadAxleConfig extends AxleConfig {
    axleIndex: number
    power?: number
    inverted?: boolean
}

export default class GamepadAxle extends Axle {
	public axle: number;
	public listener: GamepadListener;
	public power: number;
	public inverted: boolean;

    constructor(listener: GamepadListener, config: GamepadAxleConfig) {
        super();
        this.axle = config.axleIndex
        this.power = config.power ?? 1
        this.inverted = config.inverted ?? false
        this.listener = listener
        this.value = 0
        this.listener.on("axle", (index, value) => {
            if(index === this.axle) {
                this.value = Math.pow(value, this.power)
                this.setNeedsUpdate()
            }
        })
    }

    invert() {
        this.inverted = !this.inverted
        return this
    }

    getValue() {
        return this.inverted ? -this.value : this.value
    }
}