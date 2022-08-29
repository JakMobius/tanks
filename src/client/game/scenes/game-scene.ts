import {SceneConfig} from 'src/client/scenes/scene';
import PlayerControlsPacket from 'src/networking/packets/game-packets/player-controls-packet';
import PlayerChatPacket from 'src/networking/packets/game-packets/player-chat-packet';
import PlayerRoomChangePacket from 'src/networking/packets/game-packets/player-room-change-packet';
import ConnectionClient from "src/networking/connection-client";
import ClientGameWorld from "../../client-game-world";
import GeneralGameScene from "../general-game-scene";
import TankControls from "../../../controls/tank-controls";
import WorldCommunicationPacket from "../../../networking/packets/game-packets/world-communication-packet";
import EntityDataReceiveComponent from "../../../entity/components/network/entity-data-receive-component";
import ReadBuffer from "../../../serialization/binary/read-buffer";

export interface GameSceneConfig extends SceneConfig {
    client: ConnectionClient
}

export default class GameScene extends GeneralGameScene {
	public config: GameSceneConfig;
	public controlsUpdateInterval: number;
	public client: ConnectionClient;

    constructor(config: GameSceneConfig) {
        super(config)

        this.config = config
        this.controlsUpdateInterval = 0.1 // seconds
        this.client = config.client

        this.setupUpdateLoop()
        this.setupPacketHandling()
        this.displayWorld(new ClientGameWorld())

        this.client.on(WorldCommunicationPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            this.displayedWorld.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
        })

        // TODO
        // this.keyboard.onKeybinding("Cmd-B", () => {
        //     this.worldDrawer.debugDrawOn = !this.worldDrawer.debugDrawOn
        // })
    }

    private setupUpdateLoop() {
        const update = () => {
            this.screen.loop.scheduleTask(update, this.controlsUpdateInterval)
            // TODO: this is a wrong place to send these packets.

            let tank = this.controlledTank
            if(!tank) return

            let component = tank.getComponent(TankControls)
            if(component.shouldUpdate()) {
                new PlayerControlsPacket(component).sendTo(this.client.connection)
            }
        }

        update()
    }

    private setupPacketHandling() {

        this.client.on(PlayerRoomChangePacket, (packet) => {
            if(packet.error) {
                let event = "Не удалось подключиться к игре '" + packet.room + "': " + packet.error
                this.eventContainer.createEvent(event)
            } else {
                this.playerControls.disconnectAllTankControls()
                this.chatContainer.clear()
            }
        })

        this.client.on(PlayerChatPacket, (packet) => {
            this.chatContainer.addMessage(packet.text)
        })
    }

    tick(dt: number) {
        super.tick(dt)
        this.displayedWorld.tick(dt)
    }
}