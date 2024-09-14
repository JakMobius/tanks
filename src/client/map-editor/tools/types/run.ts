import Tool from '../tool';
import * as Box2D from '../../../../library/box2d';
import KeyboardController from '../../../controls/input/keyboard/keyboard-controller';
import ToolManager from "../toolmanager";
import PhysicalComponent from "src/entity/components/physics-component";
import TankControls from "src/controls/tank-controls";
import RootControlsResponder from "src/client/controls/root-controls-responder";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import Entity from "src/utils/ecs/entity";

export default class RunTool extends Tool {
	public selectingLocation: any;
	public tank: Entity;
	public keyboard: KeyboardController;
	public running: boolean;
	public runButton: any;
	public locationButton: any;
    private spawnPoint = new Box2D.Vec2(10, 10)

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "assets/map-editor/tank.png"
        this.setupMenu()
        this.selectingLocation = false

        this.keyboard = new KeyboardController()
    }

    setupMenu() {

        this.runButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(assets/map-editor/start.png)")
            .on("click",() => this.toggle())

        this.locationButton = $("<div>")
            .addClass("tool inline")
            .css("background-image", "url(assets/map-editor/locate.png)")
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
        // this.manager.setCameraMovementEnabled(false)

        // TODO: Setup an embedded server to run the game on
        // Client-only implementation limits the game functionality a lot

        this.tank = new Entity()
        ClientEntityPrefabs.types.get(EntityType.TANK_SNIPER)(this.tank)
        this.manager.world.appendChild(this.tank)

        const physicalComponent = this.tank.getComponent(PhysicalComponent)
        physicalComponent.setPosition(this.spawnPoint)
        RootControlsResponder.getInstance().connectTankControls(this.tank.getComponent(TankControls))

        // this.manager.camera.inertial = true
        // this.manager.camera.target = physicalComponent.body.GetPosition()
        // this.manager.camera.targetVelocity = physicalComponent.body.GetLinearVelocity()
    }

    onStop() {
        this.manager.setWorldAlive(false)
        // this.manager.setCameraMovementEnabled(true)

        this.tank.removeFromParent()

        RootControlsResponder.getInstance().disconnectTankControls(this.tank.getComponent(TankControls))

        // this.manager.camera.target = this.manager.camera.getPosition()
        // this.manager.camera.shaking.Set(0, 0)
        // this.manager.camera.shakeVelocity.Set(0, 0)
        // this.manager.camera.inertial = false
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