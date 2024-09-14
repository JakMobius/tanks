import {PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import GraphicsController from "src/client/ui/overlay/pause-overlay/controllers/graphics-controller";
import PauseSliderRow from "src/client/ui/overlay/pause-overlay/elements/pause-slider-row";
import GameSettings from "src/client/settings/game-settings";

export class SoundView extends PauseMenuView {

    volumeSlider = new PauseSliderRow("Громкость", 0, 100)

    constructor(controller: GraphicsController) {
        super(controller);
        this.element.append(this.volumeSlider.element)

        this.volumeSlider.setValue(GameSettings.getInstance().audio.getVolume() * 100)
        this.volumeSlider.on("value-changed", (value: number) => {
            GameSettings.getInstance().audio.setVolume(value / 100)
        })
    }
}

export default class SoundController extends PauseViewController {
    constructor() {
        super();
        this.title = "Звук"
        this.view = new SoundView(this)
    }
}