import SceneScreen from '../graphics/scene-screen';

export interface SceneConfig {
    screen: SceneScreen
}

class Scene {

    screen: SceneScreen = null
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