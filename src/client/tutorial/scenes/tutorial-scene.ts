
import * as Box2D from 'src/library/box2d';
import Scene, {SceneConfig} from 'src/client/scenes/scene';
import Camera from 'src/client/camera';
import TouchController from 'src/client/controls/interact/touchcontroller';
import PlayerControls from 'src/client/controls/playercontrols';
import GamepadManager from 'src/client/controls/interact/gamepadmanager';
import WorldDrawer from 'src/client/graphics/drawers/world-drawer';
import KeyboardController from "src/client/controls/interact/keyboardcontroller";
import ControlPanel from "../../game/ui/controlpanel";
import {getTutorialMap} from "../tutorial-map";
import ClientPlayer from "../../client-player";
import EmbeddedServerGame from "../../embedded-server/embedded-server-game";
import TutorialWorldController from "../tutorial-world-controller";
import PlayerChatPacket from "../../../networking/packets/game-packets/player-chat-packet";

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
    public game: EmbeddedServerGame
    public worldDrawer: WorldDrawer
    public worldController: TutorialWorldController

    constructor(config: TutorialSceneConfig) {
        super(config)

        this.camera = new Camera({
            baseScale: 12,
            viewport: new Box2D.Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.Vec2(0, 0),
            inertial: true
        })

        this.game = new EmbeddedServerGame({ map: getTutorialMap() })

        // const latencyImitator = new NetworkLatencyImitator(this.game.client.connection)
        // latencyImitator.ping = 100
        // latencyImitator.jitter = 50
        //this.game.client.dataHandler = latencyImitator

        this.worldController = new TutorialWorldController(this.game.serverGame)
        this.game.clientWorld.on("primary-player-set", (player) => this.onWorldPrimaryPlayerSet(player))

        this.touchController = new TouchController(this.controls, this.screen.canvas)
        this.playerControls = new PlayerControls()
        this.playerControls.setupKeyboard(this.keyboard)
        this.playerControls.setupGamepad(this.gamepad)

        this.playerControls.on("respawn", () => {})

        this.keyboard.startListening()
        this.touchController.startListening()
        this.gamepad.startListening()

        this.keyboard.keybinding("Tab", () => {
            this.performClientCommand("#switch-tank")
        })

        this.keyboard.keybinding("Cmd-B", () => {
            this.worldDrawer.debugDrawOn = !this.worldDrawer.debugDrawOn
        })

        this.worldDrawer = new WorldDrawer(this.camera, this.screen, this.game.clientWorld)

        this.game.connectClientToServer()

        this.layout()
    }

    performClientCommand(command: string) {
        new PlayerChatPacket(command).sendTo(this.game.client.connection)
    }

    layout() {
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
    }

    draw(ctx: WebGLRenderingContext, dt: number) {
        this.game.tick(dt)
        this.gamepad.refresh()
        this.playerControls.refresh()
        this.screen.clear()
        this.camera.tick(dt)
        this.worldDrawer.draw(dt)
    }

    private onWorldPrimaryPlayerSet(player: ClientPlayer) {
        this.playerControls.disconnectAllTankControls()

        if(player) {
            this.playerControls.connectTankControls(player.tank.model.controls)
            // Well, at least this approach is better than updating the tank
            // controls in a timer...
            let serverPlayer = this.game.serverGame.world.players.get(player.id)
            this.playerControls.connectTankControls(serverPlayer.tank.model.controls)
            const body = player.tank.model.getBody()
            this.camera.target = body.GetPosition()
            this.camera.targetVelocity = body.GetLinearVelocity()
        }
    }
}