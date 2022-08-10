import InputDevice from "./input/input-device";
import EventEmitter from "../../utils/event-emitter";
import KeyboardController from "./input/keyboard/keyboard-controller";
import Axle from "../../controls/axle";
import GameSettings from "../settings/game-settings";
import GamepadManager from "./input/gamepad/gamepad-manager";
import MouseController from "./input/mouse/mouse-contoller";
import CallbackActivatorAxle, {AxleCallback} from "./interact/callback-activator-axle";
import TankControls from "../../controls/tank-controls";

export default class ControlsManager extends EventEmitter {
    private static instance: ControlsManager;
    private controlAxles: Map<string, Axle> = new Map()
    private gamepadManager = new GamepadManager()
    public devices: InputDevice[];
    public axlesToUpdate: CallbackActivatorAxle[] = []
    private controlledTanks = new Set<TankControls>()
    private readonly axleUpdateCallback: AxleCallback = (axle) => this.axlesToUpdate.push(axle)

    private constructor() {
        super()
        this.devices = [];

        this.createSeparatedAxle("tank-steer", "tank-steer-right", "tank-steer-left")
        this.createSeparatedAxle("tank-throttle", "tank-throttle-forward", "tank-throttle-backward")

        this.createAxle("tank-primary-weapon")
        this.createAxle("tank-miner")

        this.createActivatorAxle("tank-respawn", () => this.emit("tank-respawn"))
        this.createActivatorAxle("game-pause", () => this.emit("game-pause"))
        this.createActivatorAxle("game-player-list",
            () => this.emit("game-player-list-show"),
            () => this.emit("game-player-list-hide"))

        this.addDevice(new KeyboardController())
        this.addDevice(new MouseController())

        this.gamepadManager.on("gamepad-connected", (gamepad) => {
            this.addDevice(gamepad)
        })

        this.gamepadManager.on("gamepad-disconnected", (gamepad) => {
            this.removeDevice(gamepad)
        })
    }

    public static getInstance(): ControlsManager {
        if (!ControlsManager.instance) {
            ControlsManager.instance = new ControlsManager();
        }
        return ControlsManager.instance;
    }

    public addDevice(device: InputDevice): void {
        this.devices.push(device)
        this.configureDevice(device)
        this.emit("device-connect", device)
    }

    public removeDevice(device: InputDevice) {
        this.devices.splice(this.devices.indexOf(device), 1)
        this.emit("device-disconnect", device)
    }

    private configureDevice(device: InputDevice) {
        device.clearAxles()

        let settings = GameSettings.getInstance().controls
        let controllerConfig = settings.getConfigForDevice(device)

        for (let [axleName, controllerAxles] of controllerConfig) {
            let axle = this.controlAxles.get(axleName)
            if (!axle) continue
            for (let controllerAxle of controllerAxles) {
                axle.addSource(device.createAxle(controllerAxle))
            }
        }
    }

    public getControlAxle(name: string): Axle {
        return this.controlAxles.get(name)
    }

    createActivatorAxle(name: string, onActivate?: () => void, onDeactivate?: () => void) {
        let axle = new CallbackActivatorAxle(this.axleUpdateCallback, onActivate, onDeactivate)
        this.controlAxles.set(name, axle)
    }

    createSeparatedAxle(name: string, straightName: string, inverseName: string) {
        let mainAxle = this.createAxle(name)
        let straightAxle = this.createAxle(straightName)
        let inverseAxle = this.createAxle(inverseName)
        mainAxle.addSource(straightAxle, Axle.Activators.linearPositive)
        mainAxle.addSource(inverseAxle, Axle.Activators.linearNegative)
    }

    createAxle(name: string) {
        let axle = new Axle()
        this.controlAxles.set(name, axle)
        return axle
    }

    connectTankControls(controls: TankControls) {
        controls.localControllers++
        controls.axles.get("y").addSource(this.controlAxles.get("tank-throttle"))
        controls.axles.get("x").addSource(this.controlAxles.get("tank-steer"))
        controls.axles.get("primary-weapon").addSource(this.controlAxles.get("tank-primary-weapon"))
        controls.axles.get("miner").addSource(this.controlAxles.get("tank-miner"))
        this.controlledTanks.add(controls)
    }

    disconnectTankControls(controls: TankControls) {
        if (!this.controlledTanks.has(controls)) return
        controls.localControllers--
        controls.axles.get("y").removeSource(this.controlAxles.get("tank-throttle"))
        controls.axles.get("x").removeSource(this.controlAxles.get("tank-steer"))
        controls.axles.get("primary-weapon").removeSource(this.controlAxles.get("tank-primary-weapon"))
        controls.axles.get("miner").removeSource(this.controlAxles.get("tank-miner"))
        this.controlledTanks.delete(controls)
    }

    disconnectAllTankControls() {
        for (let controls of this.controlledTanks) {
            this.disconnectTankControls(controls)
        }
    }

    refresh() {
        for(let device of this.devices) {
            device.refresh()
        }

        if (this.axlesToUpdate.length) {
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