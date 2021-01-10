
import Axle from '../../tanks/controls/axle';
import EventEmitter from '../../utils/eventemitter';
import TankControls from "../../tanks/controls/tankcontrols";
import GamepadManager from "./interact/gamepadmanager";
import KeyboardController from "./interact/keyboardcontroller";

class PlayerControls extends EventEmitter {
	public axles: any;
	public respawning: any;

    constructor() {
        super()

        this.axles = new Map()
        this.createAxle("tank-throttle")
        this.createAxle("tank-steer")
        this.createAxle("tank-primary-weapon")
        this.createAxle("tank-miner")

        this.createAxle("tank-respawn")

        this.respawning = true
    }

    createAxle(name: string) {
        this.axles.set(name, new Axle())
    }

    connectTankControls(controls: TankControls) {
        controls.axles.get("y").addSource(this.axles.get("tank-throttle"))
        controls.axles.get("x").addSource(this.axles.get("tank-steer"))
        controls.axles.get("primary-weapon").addSource(this.axles.get("tank-primary-weapon"))
        controls.axles.get("miner").addSource(this.axles.get("tank-miner"))
    }

    disconnectTankControls() {
        this.axles.get("tank-throttle").disconnectAll()
        this.axles.get("tank-steer").disconnectAll()
        this.axles.get("tank-primary-weapon").disconnectAll()
        this.axles.get("tank-miner").disconnectAll()
    }

    setupGamepad(gamepad: GamepadManager) {
        this.axles.get("tank-throttle")      .addSource(gamepad.createAxle(1).invert())
        this.axles.get("tank-steer")         .addSource(gamepad.createAxle(2))
        this.axles.get("tank-miner")         .addSource(gamepad.createButton(4))
        this.axles.get("tank-primary-weapon").addSource(gamepad.createButton(5))
        this.axles.get("tank-respawn")       .addSource(gamepad.createButton(2))
    }

    setupKeyboard(keyboard: KeyboardController) {
        this.axles.get("tank-throttle")
            .addSource(keyboard.createKeyAxle("KeyW")     .smooth())
            .addSource(keyboard.createKeyAxle("ArrowUp")  .smooth())
            .addSource(keyboard.createKeyAxle("KeyS")     .smooth().reverse())
            .addSource(keyboard.createKeyAxle("ArrowDown").smooth().reverse())

        this.axles.get("tank-steer")
            .addSource(keyboard.createKeyAxle("KeyD")      .smooth())
            .addSource(keyboard.createKeyAxle("ArrowRight").smooth())
            .addSource(keyboard.createKeyAxle("KeyA")      .smooth().reverse())
            .addSource(keyboard.createKeyAxle("ArrowLeft") .smooth().reverse())

        this.axles.get("tank-miner")         .addSource(keyboard.createKeyAxle("KeyQ"))
        this.axles.get("tank-primary-weapon").addSource(keyboard.createKeyAxle("Space"))
        this.axles.get("tank-respawn")       .addSource(keyboard.createKeyAxle("KeyR"))
    }

    refresh() {
        if(this.axles.get("tank-respawn").getValue() > 0.5) {
            if(!this.respawning) {
                this.respawning = true
                this.emit("respawn")
            }
        } else {
            this.respawning = false
        }
    }
}

export default PlayerControls;