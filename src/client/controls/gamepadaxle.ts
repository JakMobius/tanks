
import Axle from '../../controls/axle';
import GamepadManager from "./interact/gamepadmanager";

export default class GamepadAxle extends Axle {
	public axle: number;
	public controller: GamepadManager;
	public power: number;
	public inverted: boolean;

    constructor(controller: GamepadManager, axle: number) {
        super();
        this.axle = axle
        this.controller = controller
        this.value = 0
        this.power = 1
        this.inverted = false
        this.controller.on("axle", (index, value) => {
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