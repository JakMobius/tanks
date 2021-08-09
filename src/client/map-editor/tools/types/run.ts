
import Tool from '../tool';
import * as Box2D from '../../../../library/box2d';
import PlayerControls from '../../../controls/playercontrols';
import KeyboardController from '../../../controls/interact/keyboardcontroller';
import ToolManager from "../toolmanager";
import ClientPlayer from "../../../client-player";
import MonsterTankModel from "../../../../entity/tanks/models/monster-tank-model";
import ClientTank from "../../../entity/tank/client-tank";
import ClientMonsterTank from "../../../entity/tank/types/client-monster-tank";

export default class RunTool extends Tool {
	public selectingLocation: any;
	public tank: ClientTank;
	public keyboard: KeyboardController;
	public playerControls: PlayerControls;
	public running: boolean;
	public timer: any;
	public runButton: any;
	public locationButton: any;
    private player: ClientPlayer;
    private spawnPoint = new Box2D.Vec2(10, 10)

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "assets/img/tank.png"
        this.setupMenu()
        this.selectingLocation = false

        this.keyboard = new KeyboardController()

        this.playerControls = new PlayerControls()
        this.playerControls.setupKeyboard(this.keyboard)

        this.tank = new ClientMonsterTank({
            model: new MonsterTankModel()
        })
        
        this.playerControls.connectTankControls(this.tank.model.controls)
        
        this.player = new ClientPlayer({
            id: 0,
            nick: "Вы"
        })

        this.player.setTank(this.tank)
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

        let world = this.manager.world

        world.createPlayer(this.player)

        const body = this.player.tank.model.getBody()

        body.SetPosition(this.spawnPoint)

        this.playerControls.connectTankControls(this.player.tank.model.controls)

        this.manager.camera.inertial = true
        this.manager.camera.target = body.GetPosition()
        this.manager.camera.targetVelocity = body.GetLinearVelocity()
    }

    onStop() {
        this.manager.setWorldAlive(false)
        this.manager.setCameraMovementEnabled(true)

        this.manager.camera.target = this.manager.camera.getPosition()
        this.manager.camera.shaking.Set(0, 0)
        this.manager.camera.shakeVelocity.Set(0, 0)
        this.manager.camera.inertial = false

        this.manager.world.removePlayer(this.player)
    }

    toggleSelectLocation() {
        this.locationButton.toggleClass("selected")
        this.selectingLocation = !this.selectingLocation
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