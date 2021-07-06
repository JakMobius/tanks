import Scene from "../scenes/scene";
import Screen, {ScreenConfig} from "./screen";
import Loop from "../../utils/loop/loop";
import RenderLoop from "../../utils/loop/renderloop";

export default class SceneScreen extends Screen {

    public scene: Scene
    public loop: Loop = null

    constructor(config: ScreenConfig) {
        super(config);

        this.initLoop()

        this.loop.run = (dt: number) => this.tick(dt)
    }

    tick(dt: number): void {
        if (this.scene) {
            this.scene.draw(this.ctx, dt)
        }
    }

    resized() {
        super.resized();
        if(this.scene) this.scene.layout()
    }

    setScene(scene: Scene): void {
        if(this.scene) {
            this.scene.disappear()
            this.scene.overlayContainer.remove()
        }

        this.scene = scene
        this.scene.appear()
        this.root.append(this.scene.overlayContainer)
    }

    initLoop(): void {
        this.loop = new RenderLoop()
    }
}