
import * as Box2D from 'src/library/box2d';
import Scene, {SceneConfig} from 'src/client/scenes/scene';
import Camera from 'src/client/camera';
import TouchController from 'src/client/controls/interact/touchcontroller';
import PlayerControls from 'src/client/controls/playercontrols';
import GamepadManager from 'src/client/controls/interact/gamepadmanager';
import WorldDrawer from 'src/client/graphics/drawers/world-drawer';
import KeyboardController from "src/client/controls/interact/keyboardcontroller";
import ClientGameWorld from "../../clientgameworld";
import ControlPanel from "../../game/ui/controlpanel";
import {getTutorialMap} from "../tutorial-map";
import Player from "../../../utils/player";
import ClientTank from "../../tanks/clienttank";
import MonsterTankModel from "../../../tanks/models/monster";

export interface TutorialSceneConfig extends SceneConfig {
    username: string
}

export default class TutorialScene extends Scene {
    public camera: Camera;
    public keyboard = new KeyboardController();
    public controls = new ControlPanel();
    public gamepad = new GamepadManager();
    public touchController: TouchController;
    public playerControls: PlayerControls;
    public timer: number;
    public world: ClientGameWorld
    public worldDrawer: WorldDrawer

    constructor(config: TutorialSceneConfig) {
        super(config)

        this.camera = new Camera({
            baseScale: 3,
            viewport: new Box2D.Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.Vec2(0, 0),
            inertial: true
        })

        this.world = new ClientGameWorld({
            map: getTutorialMap()
        })

        this.touchController = new TouchController(this.controls, this.screen.canvas)
        this.playerControls = new PlayerControls()
        this.playerControls.setupKeyboard(this.keyboard)
        this.playerControls.setupGamepad(this.gamepad)

        this.playerControls.on("respawn", () => {})

        this.keyboard.startListening()
        this.touchController.startListening()
        this.gamepad.startListening()

        this.worldDrawer = new WorldDrawer(this.camera, this.screen, this.world)

        this.layout()

        this.createPlayer()
    }

    layout() {
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
    }

    pause() {
        cancelAnimationFrame(this.timer)
    }

    draw(ctx: WebGLRenderingContext, dt: number) {
        this.gamepad.refresh()
        this.playerControls.refresh()
        this.screen.clear()
        this.camera.tick(dt)
        this.worldDrawer.draw(dt)
        this.world.tick(dt)
    }

    private createPlayer() {
        let player = new Player({
            id: 0,
            nick: "Вы"
        })

        let tank = ClientTank.fromModel(new MonsterTankModel())

        tank.setupDrawer(this.screen.ctx)

        player.setTank(tank)
        player.tank.world = this.world
        player.tank.model.initPhysics(this.world.world)
        player.tank.model.body.SetPositionXY(70, 850)
        player.tank.model.body.SetAngle(4)

        this.world.createPlayer(player)
        this.world.player = player

        this.playerControls.connectTankControls(this.world.player.tank.model.controls)
        this.camera.target = this.world.player.tank.model.body.GetPosition()
        this.camera.targetVelocity = this.world.player.tank.model.body.GetLinearVelocity()
    }
}