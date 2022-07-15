import InputDevice from "./input/input-device";
import EventEmitter from "../../utils/event-emitter";
import KeyboardController from "./input/keyboard/keyboard-controller";
import Axle from "../../controls/axle";
import GameSettings from "../settings/game-settings";

export default class ControlsManager extends EventEmitter {
    private static instance: ControlsManager;
    private controlAxles: Map<string, Axle> = new Map()
    private devices: InputDevice[];

    private constructor() {
        super()
        this.devices = [];

        this.addDevice(new KeyboardController());

        this.controlAxles.set("tank-throttle",       new Axle());
        this.controlAxles.set("tank-steer",          new Axle());
        this.controlAxles.set("tank-primary-weapon", new Axle());
        this.controlAxles.set("tank-miner",          new Axle());
        this.controlAxles.set("tank-respawn",        new Axle());
        this.controlAxles.set("game-pause",          new Axle());
        this.controlAxles.set("game-player-list",    new Axle());
    }

    public static getInstance(): ControlsManager {
        if (!ControlsManager.instance) {
            ControlsManager.instance = new ControlsManager();
        }
        return ControlsManager.instance;
    }

    public addDevice(device: InputDevice): void {
        this.devices.push(device);
    }

    public getDevices(): InputDevice[] {
        return this.devices;
    }

    private configureDevice(device: InputDevice) {
        let settings = GameSettings.getInstance().controls
        let controllerConfig = settings.getConfigForDevice(device)

        for(let [axleName, controllerAxles] of controllerConfig) {
            let axle = this.controlAxles.get(axleName)
            if(!axle) continue
            for(let controllerAxle of controllerAxles) {
                axle.addSource(device.createAxle(controllerAxle))
            }
        }
    }



    public getControlAxle(name: string): void {

    }
}