import Camera from "../camera";
import KeyboardController from "../controls/interact/keyboardcontroller";
import ControlPanel from "./ui/controlpanel";
import GamepadManager from "../controls/interact/gamepadmanager";
import TouchController from "../controls/interact/touchcontroller";
import PlayerControls from "../controls/playercontrols";
import EventContainer from "../ui/overlay/events/eventcontainer";
import ChatContainer from "./ui/overlay/chat/chatcontainer";
import ClientGameWorld from "../client-game-world";
import WorldDrawer from "../graphics/drawers/world-drawer";
import * as Box2D from "../../library/box2d";
import GameMap from "../../map/gamemap";
import Scene, {SceneConfig} from "../scenes/scene";
import ClientPlayer from "../client-player";

export default class GeneralGameScene extends Scene {
    public camera: Camera;
    public keyboard = new KeyboardController();
    public controls = new ControlPanel();
    public gamepad = new GamepadManager();
    public touchController: TouchController;
    public playerControls: PlayerControls;

    public eventContainer: EventContainer;
    public chatContainer: ChatContainer;
    public world: ClientGameWorld
    public worldDrawer: WorldDrawer

    public paused: boolean = false

    constructor(config: SceneConfig) {
        super(config)

        this.setupControls()
        this.setupDrawer()
        this.setupChat()
        this.setupEventContainer()
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
            if(this.world && this.world.player) {
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

    setWorld(world: ClientGameWorld) {
        if(this.world) throw new Error("Game world cannot be changed after it's been set once")
        this.world = world
        this.worldDrawer.setWorld(world)

        this.world.on("map-change", () => {
            this.camera.defaultPosition.x = this.world.map.width / 2 * GameMap.BLOCK_SIZE
            this.camera.defaultPosition.y = this.world.map.height / 2 * GameMap.BLOCK_SIZE
        })

        this.world.on("primary-player-set", (player: ClientPlayer) => {
            this.onWorldPrimaryPlayerSet(player)
        })
    }

    layout() {
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
    }

    draw(ctx: WebGLRenderingContext, dt: number) {
        this.gamepad.refresh()
        this.playerControls.refresh()

        if(this.paused) return

        this.screen.clear()

        if(!this.world) return

        this.camera.tick(dt)
        this.worldDrawer.draw(dt)
        this.world.tick(dt)
    }

    protected onWorldPrimaryPlayerSet(player: ClientPlayer) {
        this.playerControls.disconnectAllTankControls()
        if(player) {
            const model = player.tank.model
            const body = model.getBody()
            this.playerControls.connectTankControls(model.controls)
            this.camera.target = body.GetPosition()
            this.camera.targetVelocity = body.GetLinearVelocity()
        }
    }

    protected onChat(text: string) {

    }

    protected togglePauseOverlay() {
        this.paused = !this.paused
    }
}