import {ControllerControlsConfig} from "../game-controls-settings";
import {KeyAxleConfig} from "../../controls/input/keyboard/key-axle";

export function getDefaultKeyboardControls(): ControllerControlsConfig<KeyAxleConfig> {
    return {
        "tank-throttle": [
            {key: "KeyW", smooth: 0.4},
            {key: "ArrowUp", smooth: 0.4}
        ],
        "tank-break": [
            {key: "KeyS", smooth: 0.4},
            {key: "ArrowDown", smooth: 0.4}
        ],
        "tank-steer-right": [
            {key: "KeyD", smooth: 0.4},
            {key: "ArrowRight", smooth: 0.4}
        ],
        "tank-steer-left": [
            {key: "KeyA", smooth: 0.4},
            {key: "ArrowLeft", smooth: 0.4}
        ],
        "tank-miner": [
            {key: "KeyQ"}
        ],
        "tank-primary-weapon": [
            {key: "Space"}
        ],
        "tank-respawn": [
            {key: "KeyR"}
        ],
        "game-pause": [
            {key: "Escape"},
        ]
    }
}