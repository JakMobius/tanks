import InputDevice, {InputDeviceType} from "../input-device";
import Axle from "../../../../controls/axle";
import MouseListener from "./mouse-listener";
import MouseAxle, {MouseAxleConfig} from "./mouse-axle";
import MouseButtonAxle, {MouseButtonConfig} from "./mouse-button";

export enum MouseInputType {
    axis, button
}

export type MouseInputConfig =
    (MouseButtonConfig & { type: MouseInputType.button }) |
    (MouseAxleConfig & { type: MouseInputType.axis })

export default class MouseController extends InputDevice {
    public listener: MouseListener

    constructor() {
        super();
        this.listener = new MouseListener()
    }

    createAxle(config: MouseInputConfig): Axle | null {
        if(config.type === MouseInputType.button) {
            return new MouseButtonAxle(this.listener, config)
        } else {
            return new MouseAxle(this.listener, config)
        }
    }

    clearAxles(): void {
        this.listener.emit("clear-axles")
    }

    getName(): string {
        return "Mouse"
    }

    getType(): InputDeviceType {
        return InputDeviceType.mouse;
    }
}