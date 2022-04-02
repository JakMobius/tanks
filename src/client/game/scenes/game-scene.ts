
import {SceneConfig} from 'src/client/scenes/scene';
import PlayerControlsPacket from 'src/networking/packets/game-packets/player-controls-packet';
import PlayerConfigPacket from 'src/networking/packets/game-packets/player-config-packet';
import PlayerChatPacket from 'src/networking/packets/game-packets/player-chat-packet';
import RoomListPacket from 'src/networking/packets/game-packets/room-list-packet';
import PlayerRoomRequestPacket from 'src/networking/packets/game-packets/player-room-request-packet';
import PlayerRoomChangePacket from 'src/networking/packets/game-packets/player-room-change-packet';
import PrimaryOverlay from '../ui/overlay/primary/primary-overlay';
import TankModel from "src/entity/tanks/tank-model";
import ConnectionClient from "src/networking/connection-client";
import ClientGameWorld from "../../client-game-world";
import ClientWorldBridge from "../client-world-bridge";
import {ClientTankType} from "../../entity/tank/client-tank";
import GeneralGameScene from "../general-game-scene";

export interface GameSceneConfig extends SceneConfig {
    client: ConnectionClient
}

export default class GameScene extends GeneralGameScene {
	public config: GameSceneConfig;
	public controlsUpdateInterval: number;
	public client: ConnectionClient;
	public overlay: PrimaryOverlay;

    constructor(config: GameSceneConfig) {
        super(config)

        this.config = config
        this.controlsUpdateInterval = 0.1 // seconds
        this.client = config.client

        this.setupUpdateLoop()
        this.initOverlay()
        this.setupPacketHandling()
        this.displayWorld(new ClientGameWorld())

        ClientWorldBridge.buildBridge(this.client, this.displayedWorld)

        this.overlay.show()
    }

    private initOverlay() {
        this.overlay = new PrimaryOverlay({
            root: this.overlayContainer,
            game: this
        })

        this.overlay.on("play", (nick: string, tank: ClientTankType) => {
            if(this.displayedWorld && this.displayedWorld.player) {
                let newTankId = tank.Model.getId()
                let oldTankId = (this.displayedWorld.player.tank.model.constructor as typeof TankModel).getId()
                if(newTankId === oldTankId) return
            }

            new PlayerConfigPacket(nick, tank.Model).sendTo(this.client.connection)
        })

        this.overlay.roomSelectContainer.on("select", (room: string) => {
            new PlayerRoomRequestPacket(room).sendTo(this.client.connection)
        })

        this.keyboard.keybinding("Escape", () => {
            if(this.displayedWorld && this.displayedWorld.player) {
                if (this.overlay.shown) {
                    this.overlay.hide()
                } else {
                    this.overlay.show()
                }
            }
        })
    }

    private setupUpdateLoop() {
        const update = () => {
            this.screen.loop.scheduleTask(update, this.controlsUpdateInterval)
            if(this.displayedWorld && this.displayedWorld.player && this.displayedWorld.player.tank.model.controls.shouldUpdate()) {
                new PlayerControlsPacket(this.displayedWorld.player.tank.model.controls).sendTo(this.client.connection)
            }
        }

        update()
    }

    private setupPacketHandling() {
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

    protected onChat(text: string) {
	    if(text.startsWith("/")) {
	        this.handleCommand(text)
        } else {
            new PlayerChatPacket(text).sendTo(this.client.connection)
        }
    }

    tick(dt: number) {
        super.tick(dt)
        this.displayedWorld.tick(dt)
    }

    private handleCommand(text: string) {
        if(text.startsWith("/debug")) this.worldDrawer.debugDrawOn = !this.worldDrawer.debugDrawOn
    }
}