
import Axle from '../../controls/axle';
import EventEmitter from '../../utils/event-emitter';
import TankControls from "../../controls/tank-controls";
import GamepadManager from "./interact/gamepad-manager";
import KeyboardController from "./interact/keyboard-controller";
import CallbackActivatorAxle, {AxleCallback} from "./callback-activator-axle";

export default class PlayerControls extends EventEmitter {
	public axles = new Map<string, Axle>();
	public axlesToUpdate: CallbackActivatorAxle[] = []
    private controlledTanks = new Set<TankControls>()
    private readonly axleUpdateCallback: AxleCallback = (axle) => this.axlesToUpdate.push(axle)

    constructor() {
        super()

        this.createAxle("tank-throttle")
        this.createAxle("tank-steer")
        this.createAxle("tank-primary-weapon")
        this.createAxle("tank-miner")

        this.createActivatorAxle("tank-respawn", () => this.emit("respawn"))
        this.createActivatorAxle("game-pause", () => this.emit("pause"))
        this.createActivatorAxle("game-player-list",
            () => this.emit("player-list-open"),
            () => this.emit("player-list-close")
        )
    }

    createActivatorAxle(name: string, onActivate?: () => void, onDeactivate?: () => void) {
	    let axle = new CallbackActivatorAxle(this.axleUpdateCallback, onActivate, onDeactivate)
        this.axles.set(name, axle)
    }

    createAxle(name: string) {
        this.axles.set(name, new Axle())
    }

    connectTankControls(controls: TankControls) {
        controls.localControllers++
        controls.axles.get("y").addSource(this.axles.get("tank-throttle"))
        controls.axles.get("x").addSource(this.axles.get("tank-steer"))
        controls.axles.get("primary-weapon").addSource(this.axles.get("tank-primary-weapon"))
        controls.axles.get("miner").addSource(this.axles.get("tank-miner"))
        this.controlledTanks.add(controls)
    }

    disconnectTankControls(controls: TankControls) {
        if(!this.controlledTanks.has(controls)) return
        controls.localControllers--
        controls.axles.get("y").removeSource(this.axles.get("tank-throttle"))
        controls.axles.get("x").removeSource(this.axles.get("tank-steer"))
        controls.axles.get("primary-weapon").removeSource(this.axles.get("tank-primary-weapon"))
        controls.axles.get("miner").removeSource(this.axles.get("tank-miner"))
        this.controlledTanks.delete(controls)
    }

    disconnectAllTankControls() {
        for(let controls of this.controlledTanks) {
            this.disconnectTankControls(controls)
        }
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
            .addSource(keyboard.createKeyAxle("KeyD")      .smooth(0.4))
            .addSource(keyboard.createKeyAxle("ArrowRight").smooth(0.4))
            .addSource(keyboard.createKeyAxle("KeyA")      .smooth(0.4).reverse())
            .addSource(keyboard.createKeyAxle("ArrowLeft") .smooth(0.4).reverse())

        this.axles.get("tank-miner")         .addSource(keyboard.createKeyAxle("KeyQ"))
        this.axles.get("tank-primary-weapon").addSource(keyboard.createKeyAxle("Space"))
        this.axles.get("tank-respawn")       .addSource(keyboard.createKeyAxle("KeyR"))
        this.axles.get("game-pause")         .addSource(keyboard.createKeyAxle("Escape"))
    }

    refresh() {
	    if(this.axlesToUpdate.length) {
	        // When calling getValue(), key axles may call their
            // setNeedsUpdate method immediately, which will
            // cause axlesToUpdate array to grow indefinitely.
            // So we copy this array and creating a new one to
            // store subsequent axles
	        let axlesToUpdate = this.axlesToUpdate
            this.axlesToUpdate = []
            for (let axle of axlesToUpdate) axle.getValue()
        }
    }
}