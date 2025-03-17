import {ControllerControlsConfig} from "../game-controls-settings";
import InputDevice, {AxleConfig, InputDeviceType} from "src/client/controls/input/input-device";
import {getDefaultKeyboardControls} from "./default-keyboard-settings";
import {getDefaultGamepadSettings} from "./default-gamepad-settings";

export function defaultSettingsForDevice(device: InputDevice) : ControllerControlsConfig<AxleConfig> {
    switch (device.getType()) {
        case InputDeviceType.keyboard:
            return getDefaultKeyboardControls()
        case InputDeviceType.gamepad:
            return getDefaultGamepadSettings()
        default:
            return {}
    }
}