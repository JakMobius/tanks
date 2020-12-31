import Screen from '../screen';

class Scene {

    /**
     * @type {Screen}
     */
    screen = null

    /**
     * @type {jQuery}
     */
    overlayContainer = null

    constructor(config) {
        this.overlayContainer = $("<div>")
        this.screen = config.screen
    }

    draw(ctx, dt) {}

    layout() {}
    appear() {}
    disappear() {}
}

export default Scene;