import Camera from "../camera";
import KeyboardController from "../controls/interact/keyboard-controller";
import ControlPanel from "./ui/control-panel";
import GamepadManager from "../controls/interact/gamepad-manager";
import TouchController from "../controls/interact/touch-controller";
import PlayerControls from "../controls/player-controls";
import EventContainer from "../ui/overlay/events/event-container";
import ChatContainer from "./ui/overlay/chat/chat-container";
import ClientGameWorld from "../client-game-world";
import WorldDrawer from "../graphics/drawers/world-drawer";
import * as Box2D from "../../library/box2d";
import GameMap from "../../map/game-map";
import Scene, {SceneConfig} from "../scenes/scene";
import ClientPlayer from "../client-player";
import {GamePauseOverlay} from "./ui/overlay/pause/game-pause-overlay";
import PhysicalComponent from "../../entity/physics-component";
import TilemapComponent from "../../physics/tilemap-component";
import TankControls from "../../controls/tank-controls";

export default class GeneralGameScene extends Scene {
    public camera: Camera;
    public keyboard = new KeyboardController();
    public controls = new ControlPanel();
    public gamepad = new GamepadManager();
    public touchController: TouchController;
    public playerControls: PlayerControls;

    public eventContainer: EventContainer;
    public chatContainer: ChatContainer;
    public displayedWorld: ClientGameWorld
    public worldDrawer: WorldDrawer

    public paused: boolean = false
    public didChangeSize: boolean = false
    private pauseOverlay?: GamePauseOverlay

    constructor(config: SceneConfig) {
        super(config)

        this.setupControls()
        this.setupDrawer()
        this.setupChat()
        this.setupEventContainer()
        this.setupPauseOverlay()
        this.layout()
    }

    private setupControls() {
        this.touchController = new TouchController(this.controls, this.screen.canvas)
        this.playerControls = new PlayerControls()
        this.playerControls.setupKeyboard(this.keyboard)
        this.playerControls.setupGamepad(this.gamepad)

        this.keyboard.startListening()
        this.touchController.startListening()
        this.gamepad.startListening()

        this.playerControls.on("pause", () => this.togglePauseOverlay())
    }

    private setupDrawer() {
        this.camera = new Camera({
            baseScale: 12,
            viewport: new Box2D.Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.Vec2(0, 0),
            inertial: true
        })

        this.worldDrawer = new WorldDrawer(this.camera, this.screen, null)
    }

    private setupEventContainer() {
        this.eventContainer = new EventContainer()
        this.overlayContainer.append(this.eventContainer.element)
    }

    private setupChat() {
        this.chatContainer = new ChatContainer()
        this.overlayContainer.append(this.chatContainer.element)

        this.keyboard.keybinding("Enter", () => {
            if(this.displayedWorld && this.displayedWorld.player) {
                this.chatContainer.showInput()
            }
        })

        this.chatContainer.on("chat", (text: string) => {
            this.onChat(text)
        })

        this.chatContainer.on("input-focus", () => {
            this.keyboard.stopListening()
        })

        this.chatContainer.on("input-blur", () => {
            this.keyboard.startListening()
            this.screen.canvas.focus()
        })
    }

    displayWorld(world: ClientGameWorld) {
        if(this.displayedWorld) throw new Error("Scene world cannot be changed after it's been set once")
        this.displayedWorld = world
        this.displayedWorld.addComponent(this.worldDrawer)
        this.worldDrawer.setWorld(world)

        this.displayedWorld.on("map-change", () => {
            const map = this.displayedWorld.getComponent(TilemapComponent).map
            this.camera.defaultPosition.x = map.width / 2 * GameMap.BLOCK_SIZE
            this.camera.defaultPosition.y = map.height / 2 * GameMap.BLOCK_SIZE
        })

        this.displayedWorld.on("primary-player-set", (player: ClientPlayer) => {
            this.onWorldPrimaryPlayerSet(player)
        })
    }

    layout() {
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
        this.didChangeSize = true
    }

    draw(ctx: WebGLRenderingContext, dt: number) {
        this.gamepad.refresh()
        this.playerControls.refresh()

        if(this.paused && !this.didChangeSize) return
        this.didChangeSize = false

        this.screen.clear()

        if(!this.displayedWorld) return

        this.tick(dt)
        this.worldDrawer.draw(dt)
    }

    tick(dt: number) {
        this.camera.tick(dt)
    }

    protected onWorldPrimaryPlayerSet(player: ClientPlayer) {
        this.playerControls.disconnectAllTankControls()
        if(player) {
            const model = player.tank.model
            const body = model.getComponent(PhysicalComponent).getBody()
            this.playerControls.connectTankControls(model.getComponent(TankControls))
            this.camera.target = body.GetPosition()
            this.camera.targetVelocity = body.GetLinearVelocity()
        }
    }

    protected onChat(text: string) {

    }

    protected togglePauseOverlay() {
        this.paused = !this.paused

        if(this.paused) {
            this.pauseOverlay.show()
            this.keyboard.stopListening()
        } else {
            this.pauseOverlay.hide()
            this.keyboard.startListening()
        }
    }

    private setupPauseOverlay() {
        this.pauseOverlay = new GamePauseOverlay({
            root: this.overlayContainer
        })
        this.pauseOverlay.on("close", () => {
            if(this.pauseOverlay) this.togglePauseOverlay()
        })
    }
}