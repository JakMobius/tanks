
import View from 'src/client/ui/view';
import CanvasFactory from 'src/client/utils/canvasfactory';
import Sprite from 'src/client/sprite';
import ClientTank from 'src/client/tanks/clienttank';
import * as Box2D from 'src/library/box2d'
import Camera from "src/client/camera";

export interface TankSelectElementViewConfig {
    Tank: typeof ClientTank
    previewWorld: Box2D.World
    previewCamera: Camera
}

class TankSelectElement extends View {
	public previewWorld: Box2D.World;
	public previewCamera: Camera;
	public width: number;
	public position: number;
	public canvas: HTMLCanvasElement;
	public ctx: WebGLRenderingContext;
	public title: JQuery;
	public hidden: boolean;
    canvasSize = 70;

    Tank: typeof ClientTank = null;
    tank: ClientTank = null

    constructor(options: TankSelectElementViewConfig) {
        super();
        this.Tank = options.Tank
        this.previewWorld = options.previewWorld
        this.previewCamera = options.previewCamera

        this.element.addClass("tank-preview-container")
        this.width = 120
        this.position = 0

        let factory = CanvasFactory()
        this.canvas = factory.canvas
        this.canvas.className = "preview-canvas";

        this.canvas.width = this.canvasSize * devicePixelRatio
        this.canvas.height = this.canvasSize * devicePixelRatio

        this.ctx = factory.ctx
        this.ctx.viewport(0, 0, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight)
        Sprite.applyTexture(this.ctx)

        this.title = $("<div>").addClass("tank-preview-title")
        this.title.text(this.Tank.getName())

        this.element.append(this.canvas)
        this.element.append(this.title)

        this.element.on("click", () => this.emit("click"))
        this.hidden = true
        this.element.hide()
    }

    setPosition(x: number) {
        this.position = x
        this.element.css("left", x)
    }

    show() {
        this.hidden = false
        this.element.show()
    }

    hide() {
        this.hidden = true
        this.element.hide()
    }

    createTank() {
        this.tank = new (this.Tank)()
        this.tank.setupDrawer(this.ctx)
        this.tank.model.initPhysics(this.previewWorld)
        const fixtureList = this.tank.model.body.GetFixtureList()

        fixtureList.m_filter.maskBits = 0x000
        fixtureList.m_filter.categoryBits = 0x000
    }

    getTank() {
        if(!this.tank) this.createTank()
        return this.tank
    }

    draw(dt: number) {
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
        let tank = this.getTank()
        tank.model.body.SetAngle(tank.model.body.GetAngle() + dt)
        tank.drawer.draw(this.previewCamera, dt)
    }
}

export default TankSelectElement;