import Scene from "src/client/scenes/scene";
import Screen, {ScreenConfig} from "src/client/graphics/screen";
import Loop from "src/utils/loop/loop";
import RenderLoop from "src/utils/loop/render-loop";

export default class SceneScreen extends Screen {

    public scene: Scene
    public loop: Loop = null
    // public framesLastSecond = 0
    // public lastSecondDate = 0

    constructor(config: ScreenConfig) {
        super(config);

        this.initLoop()

        this.loop.run = (dt: number) => this.tick(dt)
    }

    // benchmark() {
    //     let start = performance.now()
    //     let old = start
    //     let count = 0
    //     while(true) {
    //         let now = performance.now()
    //         if(now > start + 1000) break;
    //         this.tick((now - old) / 1000);
    //         old = now
    //         count ++
    //     }
    //     return count
    // }

    tick(dt: number): void {
        if (this.scene) {
            this.scene.draw(dt)
            // let now = Date.now()
            // if(now >= this.lastSecondDate + 2000) this.lastSecondDate = now - 1000
            // if(now >= this.lastSecondDate + 1000) {
            //     console.log("FPS: " + this.framesLastSecond)
            //     this.lastSecondDate += 1000
            //     this.framesLastSecond = 0
            // }
            // this.framesLastSecond++
        }
    }

    fitRoot() {
        super.fitRoot();
        if(this.scene) this.scene.layout()
    }

    setScene(scene: Scene): void {
        if(this.scene) {
            this.scene.disappear()
            this.scene.screen = null
            this.scene.overlayContainer.remove()
        }

        this.scene = scene
        scene.screen = this
        this.scene.appear()
        this.root.append(this.scene.overlayContainer)
    }

    initLoop(): void {
        this.loop = new RenderLoop({
            timeMultiplier: 0.001,
            maximumTimestep: 0.1
        })
    }
}