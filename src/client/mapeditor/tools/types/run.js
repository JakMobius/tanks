
const Tool = require("../tool")
const SniperTank = require("../../../tanks/models/sniper")
const Box2D = require("../../../../library/box2d")
const PlayerControls = require("../../../controls/playercontrols")
const KeyboardController = require("../../../controls/interact/keyboardcontroller")

class RunTool extends Tool {
    constructor(manager) {
        super(manager);

        this.image = "../assets/mapeditor/tank.png"
        this.setupMenu()
        this.selectingLocation = false

        this.world = new Box2D.b2World(new Box2D.b2Vec2(0, 0))
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
            .click(() => this.toggle())

        this.locationButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(../assets/mapeditor/locate.png)")
            .click(() => this.selectLocation())

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

    mouseMove(x, y) {
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

module.exports = RunTool