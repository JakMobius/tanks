import Screen from '../screen';

export interface SceneConfig {
    screen: Screen
}

class Scene {

    screen: Screen = null
    overlayContainer: JQuery = null

    constructor(config: SceneConfig) {
        this.overlayContainer = $("<div>")
        this.screen = config.screen
    }

    draw(ctx: WebGLRenderingContext, dt: number) {}

    layout() {}
    appear() {}
    disappear() {}
}

export default Scene;