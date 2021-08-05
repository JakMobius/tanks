
import * as Box2D from 'src/library/box2d';
import Scene, {SceneConfig} from 'src/client/scenes/scene';
import GameMap from 'src/map/gamemap';
import EventContainer from 'src/client/ui/overlay/events/eventcontainer';
import PlayerControlsPacket from 'src/networking/packets/game-packets/player-controls-packet';
import PlayerConfigPacket from 'src/networking/packets/game-packets/player-config-packet';
import PlayerChatPacket from 'src/networking/packets/game-packets/player-chat-packet';
import PlayerRespawnPacket from 'src/networking/packets/game-packets/player-respawn-packet';
import RoomListPacket from 'src/networking/packets/game-packets/room-list-packet';
import PlayerRoomRequestPacket from 'src/networking/packets/game-packets/player-room-request-packet';
import PlayerRoomChangePacket from 'src/networking/packets/game-packets/player-room-change-packet';
import ControlPanel from '../ui/controlpanel';
import Camera from 'src/client/camera';
import PrimaryOverlay from '../ui/overlay/primary/primaryoverlay';
import ChatContainer from '../ui/overlay/chat/chatcontainer';
import TouchController from 'src/client/controls/interact/touchcontroller';
import PlayerControls from 'src/client/controls/playercontrols';
import GamepadManager from 'src/client/controls/interact/gamepadmanager';
import WorldDrawer from 'src/client/graphics/drawers/world-drawer';
import TankModel from "src/entity/tanks/tank-model";
import AbstractClient from "src/networking/abstract-client";
import KeyboardController from "src/client/controls/interact/keyboardcontroller";
import ClientGameWorld from "../../client-game-world";
import ClientWorldBridge from "../client-world-bridge";
import {ClientTankType} from "../../entity/tank/client-tank";

export interface GameSceneConfig extends SceneConfig {
    client: AbstractClient
}

export default class GameScene extends Scene {
	public config: GameSceneConfig;
	public controlsUpdateInterval: number;
	public camera: Camera;
	public keyboard = new KeyboardController();
	public controls = new ControlPanel();
	public gamepad = new GamepadManager();
	public touchController: TouchController;
	public playerControls: PlayerControls;
	public client: AbstractClient;
	public overlay: PrimaryOverlay;
	public eventContainer: EventContainer;
	public chatContainer: ChatContainer;
	public timer: number;
	public world: ClientGameWorld
    public worldDrawer: WorldDrawer

    constructor(config: GameSceneConfig) {
        super(config)

        this.config = config

        this.controlsUpdateInterval = 0.1 // seconds

        this.camera = new Camera({
            baseScale: 3,
            viewport: new Box2D.Vec2(this.screen.width, this.screen.height),
            defaultPosition: new Box2D.Vec2(0, 0),
            inertial: true
        })

        this.client = config.client
        this.world = new ClientGameWorld()
        ClientWorldBridge.buildBridge(this.client, this.world)

        this.touchController = new TouchController(this.controls, this.screen.canvas)
        this.playerControls = new PlayerControls()
        this.playerControls.setupKeyboard(this.keyboard)
        this.playerControls.setupGamepad(this.gamepad)

        this.playerControls.on("respawn", () => {
            if (this.world && this.world.player) {
                new PlayerRespawnPacket().sendTo(this.client.connection)
            }
        })

        this.keyboard.startListening()
        this.touchController.startListening()
        this.gamepad.startListening()

        this.setupUpdateLoop()

        this.worldDrawer = new WorldDrawer(this.camera, this.screen, this.world)

        this.createChat()
        this.initOverlay()
        this.initEvents()
        this.connect()
        this.layout()

        this.overlay.show()
    }

    private initOverlay() {
        this.overlay = new PrimaryOverlay({
            root: this.overlayContainer,
            game: this
        })

        this.overlay.on("play", (nick: string, tank: ClientTankType) => {
            if(this.world && this.world.player) {
                let newTankId = tank.Model.getId()
                let oldTankId = (this.world.player.tank.model.constructor as typeof TankModel).getId()
                if(newTankId === oldTankId) return
            }

            new PlayerConfigPacket(nick, tank.Model).sendTo(this.client.connection)
        })

        this.overlay.roomSelectContainer.on("select", (room: string) => {
            new PlayerRoomRequestPacket(room).sendTo(this.client.connection)
        })

        this.keyboard.keybinding("Escape", () => {
            if(this.world && this.world.player) {
                if (this.overlay.shown) {
                    this.overlay.hide()
                } else {
                    this.overlay.show()
                }
            }
        })
    }

    private initEvents() {
        this.eventContainer = new EventContainer()
        this.overlayContainer.append(this.eventContainer.element)
    }

    private setupUpdateLoop() {
        const update = () => {
            this.screen.loop.scheduleTask(update, this.controlsUpdateInterval)
            if(this.world && this.world.player && this.world.player.tank.model.controls.shouldUpdate()) {
                new PlayerControlsPacket(this.world.player.tank.model.controls).sendTo(this.client.connection)
            }
        }

        update()
    }

    private connect() {
        this.world.on("map-change", () => {
            this.camera.defaultPosition.x = this.world.map.width / 2 * GameMap.BLOCK_SIZE
            this.camera.defaultPosition.y = this.world.map.height / 2 * GameMap.BLOCK_SIZE
        })

        this.world.on("primary-player-set", () => {
            const model = this.world.player.tank.model
            const body = model.getBody()
            this.playerControls.connectTankControls(model.controls)
            this.camera.target = body.GetPosition()
            this.camera.targetVelocity = body.GetLinearVelocity()
            this.overlay.hide()
        })

        this.client.on(RoomListPacket, (packet) => {
            this.overlay.roomSelectContainer.updateRooms(packet.rooms)
        })

        this.client.on(PlayerRoomChangePacket, (packet) => {
            if(packet.error) {
                let event = "Не удалось подключиться к игре '" + packet.room + "': " + packet.error
                this.eventContainer.createEvent(event)
            } else {
                this.playerControls.disconnectAllTankControls()

                this.chatContainer.clear()

                this.overlay.roomSelectContainer.selectRoom(packet.room)
            }
        })

        this.client.on(PlayerChatPacket, (packet) => {
            this.chatContainer.addMessage(packet.text)
        })
    }

    layout() {
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
    }

    private createChat() {
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

    pause() {
        cancelAnimationFrame(this.timer)
    }

    draw(ctx: WebGLRenderingContext, dt: number) {

        this.gamepad.refresh()
        this.playerControls.refresh()

        //this.screen.swapFramebuffers()
        this.screen.clear()

        this.camera.tick(dt)
        this.worldDrawer.draw(dt)
        this.world.tick(dt)
    }

    private onChat(text: string) {
	    if(text.startsWith("/")) {
	        this.handleCommand(text)
        } else {
            new PlayerChatPacket(text).sendTo(this.client.connection)
        }
    }

    private handleCommand(text: string) {
        if(text.startsWith("/debug")) this.worldDrawer.debugDrawOn = !this.worldDrawer.debugDrawOn
    }
}