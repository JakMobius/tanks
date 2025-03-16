import InputDevice from "./input/input-device";
import EventEmitter from "src/utils/event-emitter";
import KeyboardController from "./input/keyboard/keyboard-controller";
import Axle from "src/controls/axle";
import GameSettings from "../settings/game-settings";
import GamepadManager from "./input/gamepad/gamepad-manager";
import MouseController from "./input/mouse/mouse-contoller";
import CallbackActivatorAxle, {AxleCallback} from "./interact/callback-activator-axle";
import TankControls from "src/controls/tank-controls";

export class ControlsResponder extends EventEmitter {
    protected controlAxles: Map<string, Axle> = new Map()
    private parentResponder: ControlsResponder | null = null
    private childrenResponders: ControlsResponder[] = []
    private focusedResponder: ControlsResponder | null = null

    // Determines whether this responder should be implicitly focused
    // when focusedResponder is null
    isDefault: boolean = false

    // Determines whether this responder should always receive controls updates
    // (i.e if it's used as a handler group)
    isFlat: boolean = false
    
    focus() {
        if(this.parentResponder) {
            let responder: ControlsResponder = this

            // Cut the focus from the children
            if(this.focusedResponder) {
                let focused = this.focusedResponder
                this.focusedResponder = null
                focused.blur()
                focused.emit("blur")
            }

            while(responder.parentResponder) {
                let parent = this.parentResponder
                let oldResponder = parent.focusedResponder
                if(oldResponder === responder) break

                this.parentResponder.focusedResponder = null
                oldResponder?.blur()
                oldResponder?.emit("blur")
                this.parentResponder.focusedResponder = responder
            }

            // Notify newly focused responders
            while(responder.focusedResponder) {
                responder = responder.focusedResponder
                responder.emit("focus")
            }
        }
    }

    blur() {
        if(this.parentResponder?.focusedResponder !== this) return
        
        let responder: ControlsResponder = this
        while(responder.focusedResponder) {
            responder = responder.focusedResponder
        }

        while(responder.parentResponder) {
            responder.parentResponder.focusedResponder = null
            responder.emit("blur")
            responder = responder.parentResponder
        }
    }

    public getControlAxle(name: string): Axle {
        if (!this.controlAxles.has(name)) {
            let axle = new Axle()
            this.controlAxles.set(name, axle)
            if (this.parentResponder) {
                axle.addSource(this.parentResponder.getControlAxle(name))
            }
            return axle
        }
        return this.controlAxles.get(name)
    }

    public setParentResponder(parent: ControlsResponder | null) {
        if (this.parentResponder) {
            this.parentResponder.removeChildResponder(this)
            for (let [name, axle] of this.controlAxles.entries()) {
                axle.removeSource(this.parentResponder.getControlAxle(name))
            }
        }
        this.parentResponder = parent
        if (this.parentResponder) {
            this.parentResponder.addChildResponder(this)
            for (let [name, axle] of this.controlAxles.entries()) {
                axle.addSource(this.parentResponder.getControlAxle(name))
            }
        }
    }

    private addChildResponder(responder: ControlsResponder) {
        this.childrenResponders.push(responder)
    }

    private removeChildResponder(responder: ControlsResponder) {
        let index = this.childrenResponders.indexOf(responder)
        this.childrenResponders.splice(index, 1)
    }

    public clearChildResponders() {
        let responders = this.childrenResponders
        this.childrenResponders = []
        for (let responder of responders) {
            responder.setParentResponder(null)
        }
    }

    getChildResponders() {
        return this.childrenResponders
    }

    connectTankControls(controls: TankControls) {
        controls.axles.get("y").addSource(this.getControlAxle("tank-throttle"))
        controls.axles.get("x").addSource(this.getControlAxle("tank-steer"))
        controls.axles.get("primary-weapon").addSource(this.getControlAxle("tank-primary-weapon"))
        controls.axles.get("miner").addSource(this.getControlAxle("tank-miner"))
    }

    disconnectTankControls(controls: TankControls) {
        controls.axles.get("y").removeSource(this.getControlAxle("tank-throttle"))
        controls.axles.get("x").removeSource(this.getControlAxle("tank-steer"))
        controls.axles.get("primary-weapon").removeSource(this.getControlAxle("tank-primary-weapon"))
        controls.axles.get("miner").removeSource(this.getControlAxle("tank-miner"))
    }

    setMainResponderDelayed(responder: ControlsResponder) {
        this.once("update", () => {
            this.clearChildResponders()

            if (responder) {
                responder.setParentResponder(this)
            }
        })
    }

    emit(type: string, ...values: any[]): boolean {   
        let result = true

        for(let child of this.childrenResponders) {
            let childSuitable = child.isFlat
            if(child === this.focusedResponder) childSuitable = true
            if(!this.focusedResponder && child.isDefault) childSuitable = true
            if(!childSuitable) continue
            
            if(child?.emit(type, ...values) === false) result = false
        }

        if(super.emit(type, ...values) === false) result = false
        
        return result
    }

    onUpdate(callback: () => void) {
        this.once("update", callback)
    }
}

export default class RootControlsResponder extends ControlsResponder {
    private static instance: RootControlsResponder;
    public axlesToUpdate: CallbackActivatorAxle[] = []
    private readonly axleUpdateCallback: AxleCallback = (axle) => this.axlesToUpdate.push(axle)

    private gamepadManager = new GamepadManager()
    public devices: InputDevice[];
    public keyboard: KeyboardController

    private constructor() {
        super()
        this.devices = [];

        this.createControlAxles()

        this.keyboard = new KeyboardController()

        this.addDevice(this.keyboard)
        this.addDevice(new MouseController())

        this.gamepadManager.on("gamepad-connected", (gamepad) => {
            this.addDevice(gamepad)
        })

        this.gamepadManager.on("gamepad-disconnected", (gamepad) => {
            this.removeDevice(gamepad)
        })
    }

    private createControlAxles() {
        this.configureSeparatedAxle("tank-steer", "tank-steer-right", "tank-steer-left")
        this.configureSeparatedAxle("tank-throttle", "tank-throttle-forward", "tank-throttle-backward")

        this.getControlAxle("tank-primary-weapon")
        this.getControlAxle("tank-secondary-weapon")
        this.getControlAxle("tank-miner")

        this.configureTriggerAxle("tank-respawn", "tank-respawn", "tank-respawn-cancel")
        this.configureTriggerAxle("tank-flag-drop")
        this.configureTriggerAxle("game-chat")
        this.configureTriggerAxle("game-pause")
        this.configureTriggerAxle("game-toggle-debug")
        this.configureTriggerAxle("game-change-tank")
        this.configureTriggerAxle("game-player-list", "game-player-list-show", "game-player-list-hide")

        this.configureTriggerAxle("confirm")
        this.configureTriggerAxle("navigate-back")
        this.configureTriggerAxle("navigate-left")
        this.configureTriggerAxle("navigate-right")
        this.configureTriggerAxle("navigate-up")
        this.configureTriggerAxle("navigate-down")

        this.configureTriggerAxle("editor-undo")
        this.configureTriggerAxle("editor-redo")
        this.configureTriggerAxle("editor-save-maps")
        this.configureTriggerAxle("editor-copy")
        this.configureTriggerAxle("editor-paste")
        this.configureTriggerAxle("editor-cut")
        this.configureTriggerAxle("editor-reset-selection")
        this.configureTriggerAxle("editor-select-all")
        this.configureTriggerAxle("editor-delete")
        this.configureTriggerAxle("editor-tree-toggle")
        this.configureTriggerAxle("editor-rename")

        this.configureTriggerAxle("editor-increase-brush-size")
        this.configureTriggerAxle("editor-decrease-brush-size")
    }

    public static getInstance(): RootControlsResponder {
        if (!RootControlsResponder.instance) {
            RootControlsResponder.instance = new RootControlsResponder();
        }
        return RootControlsResponder.instance;
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

    private configureTriggerAxle(name: string, activateName?: string, deactivateName?: string) {
        if (!activateName) activateName = name
        let axle = new CallbackActivatorAxle(this.axleUpdateCallback,
            () => this.emitOnUpdate(activateName),
            deactivateName ? () => this.emitOnUpdate(deactivateName) : null)
        axle.addSource(this.getControlAxle(name))
    }

    private configureSeparatedAxle(name: string, straightName: string, inverseName: string) {
        let mainAxle = this.getControlAxle(name)
        let straightAxle = this.getControlAxle(straightName)
        let inverseAxle = this.getControlAxle(inverseName)
        mainAxle.addSource(straightAxle, Axle.Activators.linearPositive)
        mainAxle.addSource(inverseAxle, Axle.Activators.linearNegative)
    }

    refresh() {
        for (let device of this.devices) {
            device.refresh()
        }

        if (this.axlesToUpdate.length) {
            // In response to getValue() call, key axles may
            // call their setNeedsUpdate method immediately,
            // leading axlesToUpdate array to grow indefinitely.
            // Thus, this array should be copied and new one should be
            // created a new one for subsequent update requests
            let axlesToUpdate = this.axlesToUpdate
            this.axlesToUpdate = []
            for (let axle of axlesToUpdate) axle.getValue()
        }

        this.emit("update")
    }

    private emitOnUpdate(activateName: string) {
        this.once("update", () => {
            this.emit(activateName, this)
        })
    }
}