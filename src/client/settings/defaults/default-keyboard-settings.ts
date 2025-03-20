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
        "game-player-list": [{type: KeyboardInputType.key, code: "Tab"}],
        "game-pause": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Escape"}],
        "game-change-tank": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "KeyT"}],
        "game-toggle-debug": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "F3"}],
        "game-chat": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Enter"}],

        "navigate-back": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Escape"}],
        "navigate-left": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "ArrowLeft"}],
        "navigate-right": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "ArrowRight"}],
        "navigate-up": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "ArrowUp"}],
        "navigate-down": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "ArrowDown"}],
        "confirm": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Enter"}],

        "editor-undo": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyZ"}],
        "editor-redo": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyY"}],
        "editor-save": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyS"}],
        "editor-open": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyO"}],
        "editor-copy": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyC"}],
        "editor-paste": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyV"}],
        "editor-cut": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyX"}],
        "editor-reset-selection": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyD"}],
        "editor-select-all": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Ctrl-KeyA"}],
        "editor-delete": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Backspace"}],
        "editor-tree-toggle": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Space"}],
        "editor-rename": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Enter"}],

        "editor-move-tool": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "KeyV"}],
        "editor-scale-tool": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "KeyS"}],
        "editor-hand-tool": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "KeyH"}],
        "editor-pencil-tool": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "KeyP"}],
        "editor-eraser-tool": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Shift-KeyP"}],
        "editor-fill-tool": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "KeyF"}],
        "editor-block-select-tool": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "KeyB"}],

        "editor-increase-brush-size": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Shift-Equal"}],
        "editor-decrease-brush-size": [{type: KeyboardInputType.shortcutTrigger, triggerShortcut: "Minus"}]
    }
}