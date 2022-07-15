import {ControllerControlsConfig} from "../game-controls-settings";
import {AxleConfig} from "../../controls/input/input-device";

export function getDefaultGamepadSettings(): ControllerControlsConfig<AxleConfig> {
    return {
        "tank-throttle": [
            {axis: 1, invert: true}
        ],
        "tank-steer": [
            {axis: 2},
        ],
        "tank-miner": [
            {button: 4}
        ],
        "tank-primary-weapon": [
            {button: 5}
        ],
        "tank-respawn": [
            {button: 2}
        ]
    }
}