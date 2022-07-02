import Camera from "../camera";
import KeyboardController from "../controls/interact/keyboard-controller";
import ControlPanel from "./ui/control-panel";
import GamepadManager from "../controls/interact/gamepad-manager";
import TouchController from "../controls/interact/touch-controller";
import PlayerControls from "../controls/player-controls";
import EventContainer from "../ui/overlay/events/event-container";
import ChatContainer from "./ui/overlay/chat/chat-container";
import ClientGameWorld from "../client-game-world";
import WorldDrawerComponent from "../entity/components/world-drawer-component";
import * as Box2D from "../../library/box2d";
import GameMap from "../../map/game-map";
import Scene, {SceneConfig} from "../scenes/scene";
import ClientPlayer from "../client-player";
import {GamePauseOverlay} from "./ui/overlay/pause/game-pause-overlay";
import PhysicalComponent from "../../entity/components/physics-component";
import TilemapComponent from "../../physics/tilemap-component";
import TankControls from "../../controls/tank-controls";
import EntityModel from "../../entity/entity-model";
import BlockTreeDecoder from "../../networking/block-tree-decoder";
import Entity from "../../utils/ecs/entity";
import SoundHostComponent from "../entity/components/sound-host-component";

export default class GeneralGameScene extends Scene {
    public camera: Camera
    public keyboard = new KeyboardController()
    public controls = new ControlPanel()
    public gamepad = new GamepadManager()
    public touchController: TouchController
    public playerControls: PlayerControls

    public eventContainer: EventContainer
    public chatContainer: ChatContainer
    public displayedWorld: ClientGameWorld
    public controlledTank: EntityModel
    public worldDrawer: WorldDrawerComponent
    public soundHost: SoundHostComponent

    public paused: boolean = false
    public didChangeSize: boolean = false
    private pauseOverlay?: GamePauseOverlay

    constructor(config: SceneConfig) {
        super(config)

        this.setupControls()
        this.setupSound()
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

    private setupSound() {
        this.soundHost = new SoundHostComponent(this.screen.soundEngine)
    }

    private setupDrawer() {
        this.camera = new Camera({
            baseScale: 12,
            viewport: new Box2D.Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.Vec2(0, 0),
            inertial: true
        })

        this.worldDrawer = new WorldDrawerComponent(this.camera, this.screen)
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
        this.displayedWorld.addComponent(this.soundHost)
        this.worldDrawer.setWorld(world)

        this.displayedWorld.on("map-change", () => {
            const map = this.displayedWorld.getComponent(TilemapComponent).map
            this.camera.defaultPosition.x = map.width / 2 * GameMap.BLOCK_SIZE
            this.camera.defaultPosition.y = map.height / 2 * GameMap.BLOCK_SIZE
        })

        this.displayedWorld.on("primary-entity-set", (entity: EntityModel) => {
            this.onWorldPrimaryEntitySet(entity)
        })
    }

    layout() {
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
        this.didChangeSize = true
    }

    draw(dt: number) {
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

    protected onWorldPrimaryEntitySet(entity: EntityModel) {
        this.controlledTank = entity
        this.playerControls.disconnectAllTankControls()

        if(entity) {
            let body = entity.getComponent(PhysicalComponent).getBody()
            this.playerControls.connectTankControls(this.controlledTank.getComponent(TankControls))
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