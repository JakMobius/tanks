import {ControllerControlsConfig} from "../game-controls-settings";
import {KeyboardInputConfig, KeyboardInputType} from "../../controls/input/keyboard/keyboard-controller";

export function getDefaultKeyboardControls(): ControllerControlsConfig<KeyboardInputConfig> {
    return {
        "tank-throttle-forward": [
            {type: KeyboardInputType.key, key: "KeyW", smooth: 0.4},
            {type: KeyboardInputType.key, key: "ArrowUp", smooth: 0.4}
        ],
        "tank-throttle-backward": [
            {type: KeyboardInputType.key, key: "KeyS", smooth: 0.4},
            {type: KeyboardInputType.key, key: "ArrowDown", smooth: 0.4}
        ],
        "tank-steer-right": [
            {type: KeyboardInputType.key, key: "KeyD", smooth: 0.4},
            {type: KeyboardInputType.key, key: "ArrowRight", smooth: 0.4}
        ],
        "tank-steer-left": [
            {type: KeyboardInputType.key, key: "KeyA", smooth: 0.4},
            {type: KeyboardInputType.key, key: "ArrowLeft", smooth: 0.4}
        ],
        "tank-miner": [{type: KeyboardInputType.key, key: "KeyQ"}],
        "tank-primary-weapon": [{type: KeyboardInputType.key, key: "Space"}],
        "tank-respawn": [{type: KeyboardInputType.key, key: "KeyR"}],
        "game-pause": [{type: KeyboardInputType.key, key: "Escape"}],
        "game-toggle-debug": [{type: KeyboardInputType.key, key: "F3"}],
        "game-player-list": [{type: KeyboardInputType.key, key: "Tab"}],
        "game-chat": [{type: KeyboardInputType.key, key: "Enter"}],

        "editor-undo": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-Z"}],
        "editor-redo": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-Y"}],
        "editor-save-maps": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-S"}],
        "editor-copy": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-C"}],
        "editor-paste": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-V"}],
        "editor-cut": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-X"}],
        "editor-reset-selection": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-D"}],
        "editor-select-all": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-A"}],
        "editor-clear-area": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Backspace"}]
    }
}