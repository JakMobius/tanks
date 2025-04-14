import { b2Vec2 } from "@box2d/core";
import {ControllerControlsConfig} from "../game-controls-settings";
import {GamepadInputConfig, GamepadInputType} from "src/client/controls/input/gamepad/gamepad-controller";

export function getDefaultGamepadSettings(): ControllerControlsConfig<GamepadInputConfig> {
    return {
        "tank-throttle-forward": [
            {type: GamepadInputType.button, buttonIndex: 12},
            {type: GamepadInputType.button, buttonIndex: 7},
            {type: GamepadInputType.axle, axleIndex: 1, inverted: true}
        ],
        "tank-throttle-backward": [
            {type: GamepadInputType.button, buttonIndex: 13},
            {type: GamepadInputType.button, buttonIndex: 6},
            {type: GamepadInputType.axle, axleIndex: 1}
        ],
        "tank-steer-left": [
            {type: GamepadInputType.button, buttonIndex: 14},
            {type: GamepadInputType.axle, axleIndex: 2, inverted: true},
        ],
        "tank-steer-right": [
            {type: GamepadInputType.button, buttonIndex: 15},
            {type: GamepadInputType.axle, axleIndex: 2},
        ],
        "tank-miner": [
            {type: GamepadInputType.button, buttonIndex: 4}
        ],
        "tank-primary-weapon": [
            {type: GamepadInputType.button, buttonIndex: 5}
        ],
        "tank-respawn": [
            {type: GamepadInputType.button, buttonIndex: 2}
        ]
    }
}