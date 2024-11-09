import InputDevice, {AxleConfig, InputDeviceType} from "../controls/input/input-device";
import {defaultSettingsForDevice} from "./defaults/default-controls-settings";
import EventEmitter from "src/utils/event-emitter";

export type ControllerControlsConfig<T extends AxleConfig> = {
    [key: string]: T[]
}

export type ControllerControls<T extends AxleConfig> = Map<string, T[]>

export interface SerializedGameControlsSettings {
    controllerConfig?: { [key: string] : ControllerControlsConfig<AxleConfig> }
}

export default class GameControlsSettings extends EventEmitter {

    controllerConfig: Map<string, ControllerControls<AxleConfig>> = new Map()

    constructor(serialized?: SerializedGameControlsSettings) {
        super()
        serialized = Object.assign({
            controllerConfig: {}
        }, serialized)

        for(let [name, controls] of Object.entries(serialized.controllerConfig)) {
            this.controllerConfig.set(name, new Map(Object.entries(controls)))
        }
    }

    private getDeviceSectionName(device: InputDevice) {
        let type = device.getType()
        let sectionName = InputDeviceType[type]

        if (type == InputDeviceType.gamepad) return sectionName + ":" + device.getName()

        return sectionName
    }

    getConfigForDevice(device: InputDevice): ControllerControls<AxleConfig> {
        let deviceSectionName = this.getDeviceSectionName(device)
        let config = this.controllerConfig.get(deviceSectionName)

        // Load default settings for controller
        if(!config) {
            config = defaultSettingsForDevice(device)
            this.controllerConfig.set(deviceSectionName, config)
        }

        return config
    }

    serialize(): SerializedGameControlsSettings {
        let controllerConfig: { [key: string] : ControllerControlsConfig<AxleConfig> } = {}
        for(let [name, controls] of this.controllerConfig.entries()) {
            controllerConfig[name] = Object.fromEntries(controls)
        }

        return {
            controllerConfig: controllerConfig
        }
    }
}