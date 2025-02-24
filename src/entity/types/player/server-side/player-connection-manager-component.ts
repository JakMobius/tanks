import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Entity from "src/utils/ecs/entity";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import SocketPortalClient from "src/server/socket/socket-portal-client";
import {ReceivingEnd} from "src/entity/components/network/transmitting/receiving-end";
import WorldDataPacket from "src/networking/packets/game-packets/world-data-packet";
import PlayerControlsPacket from "src/networking/packets/game-packets/player-controls-packet";
import PlayerActionPacket, {PlayerActionType} from "src/networking/packets/game-packets/player-action-packet";
import EventEmitter from "src/utils/event-emitter";
import PlayerTankSelectPacket from "src/networking/packets/game-packets/player-tank-select-packet";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import ReadBuffer from "src/serialization/binary/read-buffer";
import BinaryBlockCoder from "src/serialization/binary/parsers/binary-block-coder";
import { commandName } from "src/entity/components/network/commands";
import { getPrefabNameForEntity } from "src/entity/components/prefab-id-component";

export default class PlayerConnectionManagerComponent extends EventHandlerComponent {
    client: SocketPortalClient
    end = new ReceivingEnd()

    private worldEventHandler = new BasicEventHandlerSet()
    private world: Entity
    private tank: Entity

    constructor(client: SocketPortalClient) {
        super()
        this.client = client

        this.worldEventHandler.on("tick", () => this.updateClient(), EventEmitter.PRIORITY_MONITOR)
        this.eventHandler.on("world-set", (world: Entity) => this.setWorld(world))
        this.eventHandler.on("tank-set", (tank: Entity) => this.setTank(tank))

        client.on(WorldDataPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            this.onClientWorldData(buffer)
        })

        client.on(PlayerControlsPacket, (packet) => {
            this.entity.emit("player-controls", packet)
        })

        client.on(PlayerActionPacket, (packet) => this.handlePlayerAction(packet.action))

        client.on(PlayerTankSelectPacket, (packet) => {
            this.entity.getComponent(PlayerPreferredTankComponent).selectPreferredTank(packet.tank)
        })

        client.on("disconnect", (client: SocketPortalClient) => {
            if(this.tank) this.tank.removeFromParent();
            this.entity.getComponent(PlayerWorldComponent).disconnectFromWorld()
        })
    }

    public getWorldTransmitterSet() {
        let world = this.entity.getComponent(PlayerWorldComponent).world
        if(!world) return null

        let worldTransmitComponent = world.getComponent(EntityDataTransmitComponent)
        return worldTransmitComponent.transmitterSetFor(this.end)
    }

    private onClientWorldData(buffer: ReadBuffer) {
        BinaryBlockCoder.decodeBlock(buffer, (buffer, size) => {
            let end = buffer.offset + size
            while (buffer.offset < end) {
                let entityId = buffer.readUint32()
                BinaryBlockCoder.decodeBlock(buffer, (buffer, size) => {
                    let command = buffer.readUint16()
                    let entity = this.getEntityById(entityId)
                    if (!entity) {
                        console.error("Command " + commandName(command) + " is received for an unknown entity id " + entityId)
                        return
                    }

                    let receiveComponent = entity.getComponent(EntityDataTransmitComponent)
                    if(!receiveComponent) {
                        console.error("Command " + commandName(command) + " is received for unsupported entity " + getPrefabNameForEntity(entity))
                    }
                    
                    let set = receiveComponent.transmitterSetFor(this.end)
                    set.handleResponse(command, this.entity, buffer, size)
                });
            }
        })
    }

    private getEntityById(id: number) {
        let transmitterSet = this.world.getComponent(EntityDataTransmitComponent).transmitterSetFor(this.end)
        let table = transmitterSet.getIdTable()
        return table.getEntityFor(id)
    }

    private updateClient() {
        if (!this.end.hasData()) return;
        new WorldDataPacket(this.end.spitBuffer()).sendTo(this.client.connection)
    }

    private setWorld(world: Entity) {
        // Detach all transmitters from old world, because otherwise they will
        // be mixed with new world transmitters. It might also lead to issues
        // when new world is null, when player leaves the game. Transmitters
        // will keep sending events to the disconnected player and server will crash.

        this.end.setRoot(world)

        this.world = world
        this.worldEventHandler.setTarget(world)

        if(world) {
            this.world.getComponent(EntityDataTransmitComponent).createTransmitterSetFor(this.end)
        }
    }

    private setTank(tank: Entity) {
        this.tank = tank
    }

    private handlePlayerAction(action: PlayerActionType) {
        if(!this.entity) return
        this.entity.emit("user-action", action)
    }
}