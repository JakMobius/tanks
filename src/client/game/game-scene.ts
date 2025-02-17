import PlayerChatPacket from 'src/networking/packets/game-packets/player-chat-packet';
import ConnectionClient from "src/networking/connection-client";
import GeneralGameScene from "src/client/game/general-game-scene";
import WorldCommunicationPacket from "src/networking/packets/game-packets/world-communication-packet";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import ReadBuffer from "src/serialization/binary/read-buffer";
import PlayerActionPacket, {PlayerActionType} from "src/networking/packets/game-packets/player-action-packet";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import PlayerTankSelectPacket from "src/networking/packets/game-packets/player-tank-select-packet";
import RemoteControlsManager from "src/client/controls/remote-controls-manager";

export interface GameSceneConfig {
    client: ConnectionClient
}

export default class GameScene extends GeneralGameScene {
    public clientWorld = new Entity()
    public config: GameSceneConfig;
    public controlsUpdateInterval: number;
    public client: ConnectionClient;
    public remoteControlsManager: RemoteControlsManager

    private updateIntervalIndex: number = -1

    constructor(config: GameSceneConfig) {
        super()
        this.setTitle("Танчики")

        this.config = config
        this.controlsUpdateInterval = 0.05 // seconds
        this.client = config.client
        this.remoteControlsManager = new RemoteControlsManager(this.controlsResponder, this.client.connection)
        this.remoteControlsManager.attach()

        this.setupPacketHandling()
        this.setupPlayerActions()

        clientGameWorldEntityPrefab(this.clientWorld, {})

        this.client.connection.resume()
    }

    protected onChat(text: string) {
        new PlayerChatPacket(text).sendTo(this.client.connection)
    }

    private setupUpdateLoop() {

        const update = () => {
            this.updateIntervalIndex = this.screen.loop.scheduleTask(update, this.controlsUpdateInterval)
            this.remoteControlsManager.updateIfNeeded()
        }

        update()
    }

    private setupPacketHandling() {
        this.client.on(PlayerChatPacket, (packet) => {
            // this.chatContainer.addMessage(packet.text)
        })

        this.client.on(WorldCommunicationPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            this.clientWorld.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
        })
    }

    tick(dt: number) {
        super.tick(dt)
        this.displayedWorld.emit("tick", dt)
    }

    private setupPlayerActions() {
        this.controlsResponder.on("tank-respawn", () => {
            new PlayerActionPacket(PlayerActionType.selfDestruct).sendTo(this.client.connection)
        })
        this.controlsResponder.on("tank-respawn-cancel", () => {
            new PlayerActionPacket(PlayerActionType.selfDestructCancel).sendTo(this.client.connection)
        })
        this.controlsResponder.on("tank-flag-drop", () => {
            new PlayerActionPacket(PlayerActionType.flagDrop).sendTo(this.client.connection)
        })
    }

    protected onTankSelected(tank: number) {
        new PlayerTankSelectPacket(tank).sendTo(this.client.connection)
    }

    appear() {
        super.appear();
        this.setupUpdateLoop()
        this.displayWorld(this.clientWorld)
    }

    disappear() {
        super.disappear();
        this.displayWorld(null)
        this.screen.loop.clearScheduledTask(this.updateIntervalIndex)
        this.updateIntervalIndex = -1
        this.remoteControlsManager.detach()
        this.client.connection.close()
    }
}