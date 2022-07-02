import SceneScreen from '../graphics/scene-screen';

export interface SceneConfig {
    screen: SceneScreen
}

export default class Scene {

    screen: SceneScreen = null
    overlayContainer: JQuery = null

    constructor(config: SceneConfig) {
        this.overlayContainer = $("<div>")
        this.screen = config.screen
    }

    draw(dt: number) {}

    layout() {}
    appear() {}
    disappear() {}
}