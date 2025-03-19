import InputDevice, {AxleConfig, InputDeviceType} from "./input/input-device";
import {KeyAxleConfig} from "./input/keyboard/key-axle";
import {MouseInputConfig, MouseInputType} from "./input/mouse/mouse-contoller";
import {MouseAxisDirection} from "./input/mouse/mouse-axle";
import {GamepadInputConfig, GamepadInputType} from "./input/gamepad/gamepad-controller";
import {keyboardKeyMapping, shortKeyboardKeyMapping} from "./localized-keyboard-keys";
import { KeyboardInputConfig, KeyboardInputType } from "./input/keyboard/keyboard-controller";
import { isMacOS } from "src/utils/meta-key-name";

export default class ControlsPrinter {
    static getPrintedNameOfAxle(axleConfig: AxleConfig, device: InputDevice): string {
        switch (device.getType()) {
            case InputDeviceType.gamepad:
                return this.getPrintedNameOfGamepadAxle(axleConfig as GamepadInputConfig);
            case InputDeviceType.keyboard:
                return this.getPrintedNameOfKeyboardAxle(axleConfig as KeyboardInputConfig, false);
            case InputDeviceType.mouse:
                return this.getPrintedNameOfMouseAxle(axleConfig as MouseInputConfig);
        }
    }

    static getPrintedNameOfGamepadAxle(axleConfig: GamepadInputConfig) {
        if (axleConfig.type == GamepadInputType.axle) {
            return "Ось " + axleConfig.axleIndex;
        } else {
            return "Кнопка " + axleConfig.buttonIndex;
        }
    }

    static getPrintedNameOfKeyboardAxle(axleConfig: KeyboardInputConfig, short: boolean) {
        if(axleConfig.type === KeyboardInputType.shortcutTrigger) {
            let shortcut = axleConfig.triggerShortcut
            
            if(isMacOS) shortcut.replace("Ctrl", "Meta")

            let parts = shortcut.split("-").map(key => this.getKeyName(key, short))

            if(short) return parts.join("")
            else return parts.join(" + ")

        } else {
            return this.getKeyName((axleConfig as KeyAxleConfig).code, short);
        }
    }

    static getKeyName(rawKey: string, short: boolean) {
        if (rawKey.startsWith("Digit")) return rawKey.substring(5)
        if (rawKey.startsWith("Key")) return rawKey.substring(3)
        if (rawKey.startsWith("Numpad")) return rawKey

        return (short ? shortKeyboardKeyMapping[rawKey] : keyboardKeyMapping[rawKey]) ?? rawKey
    }

    static getMouseButtonName(index: number) {
        switch (index) {
            case 0:
                return "ЛКМ";
            case 1:
                return "СКМ";
            case 2:
                return "ПКМ";
            default:
                return "Кнопка " + index;
        }
    }

    static getMouseAxisName(axis: MouseAxisDirection) {
        switch (+axis) {
            case MouseAxisDirection.x:
                return "Курсор по горизонтали";
            case MouseAxisDirection.y:
                return "Курсор по вертикали";
            case MouseAxisDirection.wheelX:
                return "Вертик. колёсико";
            case MouseAxisDirection.wheelY:
                return "Горизонт. колёсико";
            default:
                return "Ось " + axis;
        }
    }

    static getPrintedNameOfMouseAxle(axleConfig: MouseInputConfig) {
        if (axleConfig.type === MouseInputType.button) {
            return this.getMouseButtonName(axleConfig.buttonIndex);
        } else {
            return this.getMouseAxisName(axleConfig.axis);
        }
    }
}