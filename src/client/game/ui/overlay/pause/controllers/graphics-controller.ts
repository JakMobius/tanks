
import {PauseMenuView} from "../pause-menu-view";
import GamePauseViewController from "./pause-view-controller";

export class GraphicsView extends PauseMenuView {
    constructor(controller: GraphicsController) {
        super(controller);

    }
}

export default class GraphicsController extends GamePauseViewController {
    constructor() {
        super();
        this.title = "Графика"
        this.view = new GraphicsView(this)
    }
}