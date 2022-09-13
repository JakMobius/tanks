import Camera from "../camera";
import EventContainer from "../ui/overlay/events/event-container";
import ChatContainer from "./ui/overlay/chat/chat-container";
import WorldDrawerComponent from "../entity/components/world-drawer-component";
import * as Box2D from "../../library/box2d";
import GameMap from "../../map/game-map";
import Scene, {SceneConfig} from "../scenes/scene";
import {GamePauseOverlay} from "./ui/overlay/pause/game-pause-overlay";
import PhysicalComponent from "../../entity/components/physics-component";
import TilemapComponent from "../../physics/tilemap-component";
import TankControls from "../../controls/tank-controls";
import {SoundStreamPosition} from "../sound/stream/sound-stream-position-component";
import ControlsManager from "../controls/controls-manager";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import PlayerListOverlay from "./ui/overlay/player-list/player-list-overlay";
import {Constructor} from "../../serialization/binary/serializable";
import GameOverlay from "./ui/overlay/game-overlay/game-overlay";
import Entity from "../../utils/ecs/entity";
import PlayerNickOverlay from "./ui/overlay/player-nick-overlay/player-nick-overlay";
import Overlay from "../ui/overlay/overlay";

export default class GeneralGameScene extends Scene {
    public camera: Camera

    public eventContainer: EventContainer
    public chatContainer: ChatContainer
    public displayedWorld: Entity
    public controlledTank: Entity
    public worldDrawer: WorldDrawerComponent
    public soundStreamPosition: SoundStreamPosition = new SoundStreamPosition()

    public paused: boolean = false
    public didChangeSize: boolean = false
    protected pauseOverlay?: GamePauseOverlay
    protected playerListOverlay?: PlayerListOverlay
    protected playerNickOverlay?: PlayerNickOverlay
    protected modeSpecificOverlay?: Overlay

    protected controlsEventHandler = new BasicEventHandlerSet()
    private gameOverlays = new Map<Constructor<GameOverlay>, GameOverlay>();

    constructor(config: SceneConfig) {
        super(config)

        this.setupControls()
        this.setupCamera()
        this.setupDrawer()
        this.setupChat()
        this.setupEventContainer()
        this.setupPlayerNickOverlay()
        this.setupPlayerListOverlay()
        this.setupModeSpecificOverlays()
        this.setupPauseOverlay()
        this.layout()
    }

    private setupControls() {
        this.controlsEventHandler.on("game-pause", () => this.togglePauseOverlay())
        this.controlsEventHandler.on("game-player-list-show", () => this.openPlayerList())
        this.controlsEventHandler.on("game-player-list-hide", () => this.closePlayerList())
        this.controlsEventHandler.on("game-toggle-debug", () => {
             this.worldDrawer.debugDrawOn = !this.worldDrawer.debugDrawOn
        })
    }

    private openPlayerList() {
        this.playerListOverlay.show()
    }

    private closePlayerList() {
        this.playerListOverlay.hide()
    }

    private setupCamera() {
        this.camera = new Camera({
            baseScale: 12,
            viewport: new Box2D.Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.Vec2(0, 0),
            inertial: true
        })
    }

    private setupDrawer() {
        this.worldDrawer = new WorldDrawerComponent(this.camera, this.screen)
    }

    private setupEventContainer() {
        this.eventContainer = new EventContainer()
        this.overlayContainer.append(this.eventContainer.element)
    }

    private setupChat() {
        this.chatContainer = new ChatContainer()
        this.overlayContainer.append(this.chatContainer.element)

        this.controlsEventHandler.on("game-chat", () => {
            if(this.displayedWorld) {
                this.chatContainer.showInput()
            }
        })

        this.chatContainer.on("chat", (text: string) => {
            this.onChat(text)
        })

        this.chatContainer.on("input-focus", () => {
            ControlsManager.getInstance().keyboard.listener.stopListening()
        })

        this.chatContainer.on("input-blur", () => {
            ControlsManager.getInstance().keyboard.listener.startListening()
            this.screen.canvas.focus()
        })
    }

    displayWorld(world: Entity) {
        if(this.displayedWorld) throw new Error("Scene world cannot be changed after it was set once")
        this.displayedWorld = world
        this.displayedWorld.addComponent(this.worldDrawer)
        this.worldDrawer.setWorld(world)

        this.displayedWorld.on("map-change", () => {
            const map = this.displayedWorld.getComponent(TilemapComponent).map
            this.camera.defaultPosition.x = map.width / 2 * GameMap.BLOCK_SIZE
            this.camera.defaultPosition.y = map.height / 2 * GameMap.BLOCK_SIZE
        })

        this.displayedWorld.on("primary-entity-set", (entity: Entity) => {
            this.onWorldPrimaryEntitySet(entity)
        })

        this.displayedWorld.on("overlay-data", (overlayClass: Constructor<GameOverlay>, data: any) => {
            this.handleOverlayData(overlayClass, data)
        })

        this.playerListOverlay.setGameWorld(world)
        this.playerNickOverlay.setWorld(world)
    }

    layout() {
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
        this.didChangeSize = true
    }

    draw(dt: number) {
        ControlsManager.getInstance().refresh()

        if(this.paused && !this.didChangeSize) return
        this.didChangeSize = false

        this.screen.clear()

        if(!this.displayedWorld) return

        this.tick(dt)
        this.worldDrawer.draw(dt)
    }

    private tickSound(dt: number) {
        this.soundStreamPosition.position = this.camera.position
        this.soundStreamPosition.velocity = this.camera.velocity
        this.screen.soundEngine.emit("tick", dt)
    }

    tick(dt: number) {
        this.camera.tick(dt)
        this.tickSound(dt)
    }

    protected onWorldPrimaryEntitySet(entity: Entity) {
        this.controlledTank = entity
        ControlsManager.getInstance().disconnectAllTankControls()

        if(entity) {
            let body = entity.getComponent(PhysicalComponent).getBody()
            ControlsManager.getInstance().connectTankControls(this.controlledTank.getComponent(TankControls))
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
            this.controlsEventHandler.setTarget(null)
            // TODO: ugly
            this.screen.soundOutput.output.gain.value = 0
        } else {
            this.pauseOverlay.hide()
            this.controlsEventHandler.setTarget(ControlsManager.getInstance())
            this.screen.soundOutput.output.gain.value = 1
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

    private setupPlayerListOverlay() {
        this.playerListOverlay = new PlayerListOverlay({
            root: this.overlayContainer
        })
    }

    private setupPlayerNickOverlay() {
        this.playerNickOverlay = new PlayerNickOverlay({
            root: this.overlayContainer
        })
        this.playerNickOverlay.setCamera(this.camera)
        this.playerNickOverlay.show()
    }

    private setupModeSpecificOverlays() {
        this.modeSpecificOverlay = new Overlay({
            root: this.overlayContainer
        })
        this.modeSpecificOverlay.show()
        this.overlayContainer.append(this.modeSpecificOverlay.overlay)
    }

    private handleOverlayData(overlayClass: Constructor<GameOverlay>, data: any) {
        let overlay = this.gameOverlays.get(overlayClass)
        if(!overlay) {
            overlay = new overlayClass({
                root: this.modeSpecificOverlay.overlay,
                world: this.displayedWorld
            })
            this.gameOverlays.set(overlayClass, overlay)
        }
        overlay.setData(data)
    }

    appear() {
        super.appear();
        this.screen.soundOutput.position = this.soundStreamPosition
        this.controlsEventHandler.setTarget(ControlsManager.getInstance())
    }

    disappear() {
        super.disappear();
        this.screen.soundOutput.position = null
        this.controlsEventHandler.setTarget(null)
    }
}