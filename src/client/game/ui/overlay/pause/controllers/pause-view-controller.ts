import Controller from "src/client/ui/controller/controller";
import {PauseMenuView} from "../pause-menu-view";
import KeyboardController from "src/client/controls/input/keyboard/keyboard-controller";

export default class GamePauseViewController extends Controller<PauseMenuView> {

    keyboard = new KeyboardController()

    constructor() {
        super();

        // this.keyboard.keybinding("Escape", () => this.navigateBack())
    }

    navigateBack() {
        let navigationView = this.navigationView
        if(navigationView.stack.length == 1) navigationView.emit("close")
        else navigationView.popController()
    }

    onFocus() {
        super.onFocus();
        // this.keyboard.startListening()
    }

    onBlur() {
        super.onBlur();
        // this.keyboard.stopListening()
    }
}