import GamepadController from "./gamepad-controller";
import DocumentEventHandler from "../../interact/document-event-handler";

navigator.getGamepads = navigator.getGamepads || (navigator as any)["webkitGetGamepads"]

export default class GamepadManager extends DocumentEventHandler {
    public gamepads: GamepadController[] = []

    constructor() {
        super()
        this.target = window
        if(navigator.getGamepads) {
            this.bind("gamepadconnected", this.gamepadConnected)
            this.bind("gamepaddisconnected", this.gamepadDisconnected)
        }
    }

    private createGamepad(index: number) {
        this.destroyGamepad(index);

        let gamepad = new GamepadController(index)
        this.gamepads[index] = gamepad
        this.emit("gamepad-connected", gamepad)
    }

    private destroyGamepad(index: number) {
        if(this.gamepads[index]) {
            this.gamepads[index].clearAxles()
            this.emit("gamepad-disconnected", this.gamepads[index])
            this.gamepads[index] = null
        }
    }

    gamepadConnected(event: GamepadEvent) {
        this.createGamepad(event.gamepad.index)
    }

    gamepadDisconnected(event: GamepadEvent) {
        this.destroyGamepad(event.gamepad.index)
    }
}