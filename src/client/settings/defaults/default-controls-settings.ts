import {ControllerControls, ControllerControlsConfig} from "../game-controls-settings";
import InputDevice, {AxleConfig, InputDeviceType} from "src/client/controls/input/input-device";
import {getDefaultKeyboardControls} from "./default-keyboard-settings";
import {getDefaultGamepadSettings} from "./default-gamepad-settings";

export function defaultSettingsForDevice(device: InputDevice) : ControllerControls<AxleConfig> {
    let result: ControllerControlsConfig<AxleConfig>
    switch (device.getType()) {
        case InputDeviceType.keyboard:
            result = getDefaultKeyboardControls()
            break
        case InputDeviceType.gamepad:
            result = getDefaultGamepadSettings()
            break
        default:
            result = {}
            break
    }

    return new Map(Object.entries(result))
}