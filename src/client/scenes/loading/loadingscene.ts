/* @load-resource: "./loading-scene.scss" */

import Scene, {SceneConfig} from '../scene';

import ParticleProgram from '../../graphics/programs/particleprogram';
import Camera from '../../camera';
import * as Box2D from '../../../library/box2d';
import Particle from '../../particles/particle';
import Color from '../../../utils/color';
import Progress from "../../utils/progress";
import phrases from "./phrases";

export interface LoadingSceneConfig extends SceneConfig {
    progress: Progress
}

class LoadingScene extends Scene {
	public time: number;
	public progress: Progress;
	public camera: Camera;
	public program: ParticleProgram;
	public decoration: Particle;
	public scaleBackground: Color;
	public scaleForeground: Color;
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
        this.program = new ParticleProgram("loading-program", this.screen.ctx)
        this.decoration = new Particle({ x: 0, y: 0 })
        this.scaleBackground = new Color(200, 200, 200);
        this.scaleForeground = new Color(150, 240, 150);
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

    draw(ctx: WebGLRenderingContext, dt: number) {
        this.program.use()
        this.program.prepare()

        this.drawScaleBackground()
        this.drawScaleForeground()

        this.program.matrixUniform.setMatrix(this.camera.matrix.m)
        this.program.draw()
        this.time += dt
    }

    drawScaleBackground() {
        this.decoration.x = 0
        this.decoration.y = 0
        this.decoration.width = 400
        this.decoration.height = 20
        this.decoration.color = this.scaleBackground
        this.program.drawParticle(this.decoration)
    }

    drawScaleForeground() {
        const fraction = this.progress.completeFraction()
        this.decoration.x = -200 * (1 - fraction)
        this.decoration.y = 0
        this.decoration.width = 400 * fraction
        this.decoration.height = 20
        this.decoration.color = this.scaleForeground
        this.program.drawParticle(this.decoration)
    }
}

export default LoadingScene;