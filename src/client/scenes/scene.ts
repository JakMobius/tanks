/* @load-resource: './overlay-container.scss' */

import SceneScreen from 'src/client/graphics/scene-screen';
import EventEmitter from "src/utils/event-emitter";
import RootControlsResponder from "src/client/controls/root-controls-responder";

export default class Scene extends EventEmitter {

    private title: string
    screen: SceneScreen = null
    overlayContainer: JQuery = null

    constructor() {
        super()
        this.overlayContainer = $("<div>").addClass("overlay-container")
    }

    setTitle(title: string) {
        this.title = title
        this.emit("title-set", this.title)
    }

    getTitle() {
        return this.title
    }

    draw(dt: number) {
        RootControlsResponder.getInstance().refresh()
    }

    layout() {}
    appear() {}
    disappear() {}
}