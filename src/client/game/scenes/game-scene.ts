import {SceneConfig} from 'src/client/scenes/scene';
import PlayerControlsPacket from 'src/networking/packets/game-packets/player-controls-packet';
import PlayerChatPacket from 'src/networking/packets/game-packets/player-chat-packet';
import ConnectionClient from "src/networking/connection-client";
import GeneralGameScene from "../general-game-scene";
import TankControls from "../../../controls/tank-controls";
import WorldCommunicationPacket from "../../../networking/packets/game-packets/world-communication-packet";
import EntityDataReceiveComponent from "../../../entity/components/network/receiving/entity-data-receive-component";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import PlayerRespawnPacket from "../../../networking/packets/game-packets/player-respawn-packet";
import Entity from "../../../utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "../../client-game-world-entity-prefab";

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
        this.setupRespawnControl()

        let world = new Entity()
        clientGameWorldEntityPrefab(world, {})
        this.displayWorld(world)
    }

    protected onChat(text: string) {
        new PlayerChatPacket(text).sendTo(this.client.connection)
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
        this.client.on(PlayerChatPacket, (packet) => {
            this.chatContainer.addMessage(packet.text)
        })

        this.client.on(WorldCommunicationPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            this.displayedWorld.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
        })
    }

    tick(dt: number) {
        super.tick(dt)
        this.displayedWorld.propagateEvent("tick", dt)
    }

    private setupRespawnControl() {
        this.controlsEventHandler.on("tank-respawn", () => {
            new PlayerRespawnPacket().sendTo(this.client.connection)
        })
    }
}