import {PauseMenuView} from "../pause-menu-view";
import GamePauseViewController from "./pause-view-controller";

export class ControlsView extends PauseMenuView {
    constructor(controller: ControlsController) {
        super(controller);

    }
}

export default class ControlsController extends GamePauseViewController {
    constructor() {
        super();
        this.title = "Управление"
        this.view = new ControlsView(this)
    }
}