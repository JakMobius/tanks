import {ControllerControlsConfig} from "../game-controls-settings";
import {KeyboardInputConfig, KeyboardInputType} from "src/client/controls/input/keyboard/keyboard-controller";

export function getDefaultKeyboardControls(): ControllerControlsConfig<KeyboardInputConfig> {
    return {
        "tank-throttle-forward": [
            {type: KeyboardInputType.key, code: "KeyW", smooth: 0.4},
            {type: KeyboardInputType.key, code: "ArrowUp", smooth: 0.4}
        ],
        "tank-throttle-backward": [
            {type: KeyboardInputType.key, code: "KeyS", smooth: 0.4},
            {type: KeyboardInputType.key, code: "ArrowDown", smooth: 0.4}
        ],
        "tank-steer-right": [
            {type: KeyboardInputType.key, code: "KeyD", smooth: 0.4},
            {type: KeyboardInputType.key, code: "ArrowRight", smooth: 0.4}
        ],
        "tank-steer-left": [
            {type: KeyboardInputType.key, code: "KeyA", smooth: 0.4},
            {type: KeyboardInputType.key, code: "ArrowLeft", smooth: 0.4}
        ],
        "tank-miner": [{type: KeyboardInputType.key, code: "KeyQ"}],
        "tank-primary-weapon": [{type: KeyboardInputType.key, code: "Space"}],
        "tank-respawn": [{type: KeyboardInputType.key, code: "KeyR"}],
        "tank-flag-drop": [{type: KeyboardInputType.key, code: "KeyF"}],
        "game-pause": [{type: KeyboardInputType.key, code: "Escape"}],
        "game-change-tank": [{type: KeyboardInputType.key, code: "KeyT"}],
        "game-toggle-debug": [{type: KeyboardInputType.key, code: "F3"}],
        "game-player-list": [{type: KeyboardInputType.key, code: "Tab"}],
        "game-chat": [{type: KeyboardInputType.key, code: "Enter"}],

        "navigate-back": [{type: KeyboardInputType.key, code: "Escape"}],
        "navigate-left": [{type: KeyboardInputType.key, code: "ArrowLeft"}],
        "navigate-right": [{type: KeyboardInputType.key, code: "ArrowRight"}],
        "navigate-up": [{type: KeyboardInputType.key, code: "ArrowUp"}],
        "navigate-down": [{type: KeyboardInputType.key, code: "ArrowDown"}],
        "confirm": [{type: KeyboardInputType.key, code: "Enter"}],

        "editor-undo": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyZ"}],
        "editor-redo": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyY"}],
        "editor-save-maps": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyS"}],
        "editor-copy": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyC"}],
        "editor-paste": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyV"}],
        "editor-cut": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyX"}],
        "editor-reset-selection": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyD"}],
        "editor-select-all": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyA"}],
        "editor-delete": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Backspace"}],
        "editor-tree-toggle": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Space"}],
        "editor-rename": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Enter"}],

        "editor-increase-brush-size": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Shift-Equal"}],
        "editor-decrease-brush-size": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Minus"}]
    }
}