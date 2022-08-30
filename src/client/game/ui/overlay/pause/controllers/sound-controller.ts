import {PauseMenuView} from "../pause-menu-view";
import GamePauseViewController from "./pause-view-controller";
import GraphicsController from "./graphics-controller";

export class SoundView extends PauseMenuView {
    constructor(controller: GraphicsController) {
        super(controller);
        this.addSubtitle("Он есть. Нечего тут смотреть.")

    }
}

export default class SoundController extends GamePauseViewController {
    constructor() {
        super();
        this.title = "Звук"
        this.view = new SoundView(this)
    }
}