
import Tool from '../tool';
import SniperTank from '../../../tanks/models/sniper';
import * as Box2D from '../../../../library/box2d';
import PlayerControls from '../../../controls/playercontrols';
import KeyboardController from '../../../controls/interact/keyboardcontroller';
import ToolManager from "../toolmanager";

class RunTool extends Tool {
	public selectingLocation: any;
	public world: any;
	public tank: any;
	public keyboard: any;
	public playerControls: any;
	public running: any;
	public timer: any;
	public runButton: any;
	public locationButton: any;

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "../assets/mapeditor/tank.png"
        this.setupMenu()
        this.selectingLocation = false

        this.world = new Box2D.World(new Box2D.Vec2(0, 0))
        this.tank = new SniperTank()
        this.tank.setupDrawer(this.manager.screen.ctx)
        this.tank.model.initPhysics(this.world)

        this.keyboard = new KeyboardController()

        this.playerControls = new PlayerControls()
        this.playerControls.setupKeyboard(this.keyboard)

        this.playerControls.connectTankControls(this.tank.model.controls)

        this.running = false
        this.timer = 0
    }

    setupMenu() {

        this.runButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(../assets/mapeditor/start.png)")
            .on("click",() => this.toggle())

        this.locationButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(../assets/mapeditor/locate.png)")
            .on("click",() => this.selectLocation())

        this.settingsView = $("<div>")
            .append(this.locationButton)
            .append(this.runButton)
            .css("width", "100px")
            .css("height", "100%")
    }

    toggle() {
        this.running = !this.running
        if(this.running) {
            this.bindCamera()
        } else {
            this.unbindCamera()
        }
    }

    bindCamera() {
        this.manager.setNeedsRedraw()
        this.manager.camera.inertial = true
        this.manager.camera.target = this.tank.model.body.GetPosition()
    }

    unbindCamera() {
        this.manager.camera.target = this.manager.camera.getPosition()
        this.manager.camera.shaking.Set(0, 0)
        this.manager.camera.shakeVelocity.Set(0, 0)
        this.manager.camera.inertial = false
    }

    selectLocation() {
        this.locationButton.toggleClass("selected")
        this.selectingLocation = !this.selectingLocation
    }

    drawDecorations() {
        if(this.running) {
            this.tick()
            this.manager.setNeedsRedraw()
        } else {
            this.tank.drawer.draw(this.manager.camera, 0)
        }
    }

    tick() {
        let now = Date.now() / 1000
        let dt = now - this.timer
        this.timer = now

        if(dt > 0.1) dt = 0.1

        let steps = Math.floor(dt * 500)
        if(steps > 10) steps = 10

        for(let i = 0; i < steps; i++)
            this.world.Step(1 / 500, 1, 1)

        this.world.ClearForces()

        this.tank.tick(dt)
        this.tank.drawer.draw(this.manager.camera, dt)
    }

    mouseMove(x: number, y: number) {
        super.mouseMove(x, y);


    }

    becomeActive() {
        super.becomeActive();
        this.manager.setNeedsRedraw()
        this.keyboard.startListening()
    }

    resignActive() {
        super.resignActive();
        this.manager.setNeedsRedraw()
        this.keyboard.stopListening()

        if(this.running) {
            this.unbindCamera()
        }
    }
}

export default RunTool;