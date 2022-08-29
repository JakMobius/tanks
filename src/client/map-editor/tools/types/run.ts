import Tool from '../tool';
import * as Box2D from '../../../../library/box2d';
import PlayerControls from '../../../controls/interact/player-controls';
import KeyboardController from '../../../controls/input/keyboard/keyboard-controller';
import ToolManager from "../toolmanager";
import PhysicalComponent from "../../../../entity/components/physics-component";
import TankControls from "../../../../controls/tank-controls";
import EntityModel from "../../../../entity/entity-model";
import Player from "../../../../player";
import ControlsManager from "../../../controls/controls-manager";

export default class RunTool extends Tool {
	public selectingLocation: any;
	public tank: EntityModel;
	public keyboard: KeyboardController;
	public playerControls: PlayerControls;
	public running: boolean;
	public runButton: any;
	public locationButton: any;
    private player: Player;
    private spawnPoint = new Box2D.Vec2(10, 10)

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "assets/img/tank.png"
        this.setupMenu()
        this.selectingLocation = false

        this.keyboard = new KeyboardController()

        // this.tank = new ClientMonsterTank({
        //     model: new MonsterTankModel()
        // })
        
        this.player = new Player({
            id: 0,
            nick: "Вы"
        })
    }

    setupMenu() {

        this.runButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(assets/img/start.png)")
            .on("click",() => this.toggle())

        this.locationButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(assets/img/locate.png)")
            .on("click",() => this.toggleSelectLocation())

        this.settingsView = $("<div>")
            .append(this.locationButton)
            .append(this.runButton)
            .css("width", "100px")
            .css("height", "100%")
    }

    toggle() {
        this.running = !this.running
        if(this.running) {
            this.onRun()
        } else {
            this.onStop()
        }
    }

    onRun() {
        this.manager.setNeedsRedraw()
        this.manager.setWorldAlive(true)
        this.manager.setCameraMovementEnabled(false)

        const physicalComponent = this.player.tank.getComponent(PhysicalComponent)

        physicalComponent.setPosition(this.spawnPoint)

        ControlsManager.getInstance().connectTankControls(this.player.tank.getComponent(TankControls))

        this.manager.camera.inertial = true
        this.manager.camera.target = physicalComponent.body.GetPosition()
        this.manager.camera.targetVelocity = physicalComponent.body.GetLinearVelocity()
    }

    onStop() {
        this.manager.setWorldAlive(false)
        this.manager.setCameraMovementEnabled(true)

        ControlsManager.getInstance().disconnectTankControls(this.player.tank.getComponent(TankControls))

        this.manager.camera.target = this.manager.camera.getPosition()
        this.manager.camera.shaking.Set(0, 0)
        this.manager.camera.shakeVelocity.Set(0, 0)
        this.manager.camera.inertial = false
    }

    toggleSelectLocation() {
        this.locationButton.toggleClass("selected")
        this.selectingLocation = !this.selectingLocation
    }

    becomeActive() {
        super.becomeActive();
        this.manager.setNeedsRedraw()
    }

    resignActive() {
        super.resignActive();
        this.manager.setNeedsRedraw()

        if(this.running) {
            this.onStop()
        }
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);

        if(this.selectingLocation) {
            this.toggleSelectLocation()
            this.spawnPoint.Set(x, y)
        }
    }
}