/* @load-resource: "./loading-scene.scss" */

import Scene, {SceneConfig} from '../scene';

import Camera from '../../camera';
import * as Box2D from '../../../library/box2d';
import Progress from "src/client/utils/progress";
import phrases from "./phrases";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";

export interface LoadingSceneConfig extends SceneConfig {
    progress: Progress
}

export default class LoadingScene extends Scene {
    public static scaleBackground = 0xFFC8C8C8
    public static scaleForeground = 0xFF96F096

	public time: number;
	public progress: Progress;
	public camera: Camera;
	public program: ConvexShapeProgram;
	public title: JQuery;
	public phrase: number;
	public interval: number

    constructor(config: LoadingSceneConfig) {
        super(config)
        this.time = 0
        this.progress = config.progress

        this.camera = new Camera({
            viewport: new Box2D.Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.Vec2(),
            limit: false
        })
        this.camera.tick(0)
        this.program = new ConvexShapeProgram(this.screen.ctx)
        this.title = $("<h1>").addClass("loading-text")

        this.title.hide()
        this.overlayContainer.append(this.title)
        this.phrase = null
        this.updatePhrase()
    }

    layout() {
        super.layout();
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
        this.camera.tick(0)
    }

    disappear() {
        super.disappear()
        clearInterval(this.interval)
    }

    appear() {
        super.appear();
        this.interval = setInterval(() => this.updatePhrase(), 2500) as any as number
    }

    updatePhrase() {
        if (this.phrase == null) {
            this.newPhrase()
        } else {
            this.title.fadeOut(600, () => this.newPhrase())
        }
    }

    newPhrase() {
        let newPhrase
        do {
            newPhrase = Math.floor(Math.random() * phrases.length)
        } while(newPhrase === this.phrase)

        this.title.text(phrases[newPhrase])
        this.title.fadeIn(600)

        this.phrase = newPhrase
    }

    draw(dt: number) {
        this.program.reset()

        this.drawScaleBackground()
        this.drawScaleForeground()

        this.program.bind()
        this.program.setCamera(this.camera)
        this.program.draw()
        this.time += dt
    }

    drawScaleBackground() {
        this.program.drawRectangle(-200, -10, 200, 10, LoadingScene.scaleBackground)
    }

    drawScaleForeground() {
        const fraction = this.progress.completeFraction()
        this.program.drawRectangle(-200, -10, 400 * fraction - 200, 10, LoadingScene.scaleForeground)
    }
}