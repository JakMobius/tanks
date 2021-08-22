import Scene from "../scenes/scene";
import Screen, {ScreenConfig} from "./screen";
import Loop from "../../utils/loop/loop";
import HighPrecisionLoop from "../../utils/loop/high-precision-loop";
import RenderLoop from "../../utils/loop/renderloop";

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
            this.scene.draw(this.ctx, dt)
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
            this.scene.overlayContainer.remove()
        }

        this.scene = scene
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