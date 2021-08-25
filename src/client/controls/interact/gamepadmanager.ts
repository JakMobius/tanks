
import DocumentEventHandler from './documenteventhandler';
import GamepadAxle from '../gamepadaxle';
import GamepadButton from '../gamepadbutton';

navigator.getGamepads = navigator.getGamepads || (navigator as any)["webkitGetGamepads"]

export default class GamepadManager extends DocumentEventHandler {
	public gamepad: number;
	public axes: number[];
	public buttons: number[];

    constructor() {
        super();

        this.gamepad = null
        this.axes = []
        this.buttons = []
        this.target = window
    }

    startListening() {
        if(navigator.getGamepads) {
            this.bind("gamepadconnected", this.gamepadConnected)
            this.bind("gamepaddisconnected", this.gamepadDisconnected)
        }
    }

    refresh() {
        if(this.gamepad === null) return

        for(let [i, button] of navigator.getGamepads()[this.gamepad].buttons.entries()) {
            let value = typeof button === "number" ? button : button.value
            if(this.buttons[i] !== value) {
                this.emit("button", i, value)
                this.buttons[i] = value
            }
        }

        for(let [i, axis] of navigator.getGamepads()[this.gamepad].axes.entries()) {
            if(this.axes[i] !== axis) {
                this.emit("axle", i, axis)
                this.axes[i] = axis
            }
        }
    }

    gamepadConnected(event: GamepadEvent) {
        if(this.gamepad !== null) {
            return
        }
        this.gamepad = event.gamepad.index
        this.axes = new Array(navigator.getGamepads()[this.gamepad].axes.length)
    }

    gamepadDisconnected(event: GamepadEvent) {
        if(event.gamepad.index === this.gamepad) {
            this.gamepad = null
        }
    }

    createAxle(index: number): GamepadAxle {
        return new GamepadAxle(this, index)
    }

    createButton(index: number): GamepadButton {
        return new GamepadButton(this, index)
    }
}