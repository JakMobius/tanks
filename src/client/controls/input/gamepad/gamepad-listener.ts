import DocumentEventHandler from "../../interact/document-event-handler";

export default class GamepadListener extends DocumentEventHandler {
    public gamepadIndex: number | null;
    public axes: number[] = []
    public buttons: number[] = []

    constructor(gamepadIndex: number) {
        super()
        this.gamepadIndex = gamepadIndex

        let gamepad = navigator.getGamepads()[gamepadIndex]

        this.axes = new Array(gamepad.axes.length).fill(0)
        this.buttons = new Array(gamepad.buttons.length).fill(0)
    }

    refresh() {
        if(this.gamepadIndex === null) return
        let gamepad = navigator.getGamepads()[this.gamepadIndex]

        for(let [i, button] of gamepad.buttons.entries()) {
            let value = typeof button === "number" ? button : button.value
            if(this.buttons[i] !== value) {
                this.emit("button", i, value)
                this.buttons[i] = value
            }
        }

        for(let [i, axis] of gamepad.axes.entries()) {
            if(this.axes[i] !== axis) {
                this.emit("axle", i, axis)
                this.axes[i] = axis
            }
        }
    }
}