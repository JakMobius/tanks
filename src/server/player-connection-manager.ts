import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import Entity from "../utils/ecs/entity";
import ServerGameWorld from "./server-game-world";
import EntityDataTransmitComponent from "../entity/components/network/transmitting/entity-data-transmit-component";
import TransformComponent from "../entity/components/transform-component";
import PhysicalComponent from "../entity/components/physics-component";
import SocketPortalClient from "./socket/socket-portal-client";
import {ReceivingEnd} from "../entity/components/network/transmitting/receiving-end";
import PrimaryPlayerTransmitter from "../entity/components/network/primary-player/primary-player-transmitter";
import EntityModel from "../entity/entity-model";
import {b2Vec2} from "../library/box2d/common/b2_math";
import Player from "../player";
import WorldCommunicationPacket from "../networking/packets/game-packets/world-communication-packet";
import PlayerControlsPacket from "../networking/packets/game-packets/player-controls-packet";
import TankControls from "../controls/tank-controls";
import PlayerRespawnPacket from "../networking/packets/game-packets/player-respawn-packet";
import PlayerChatPacket from "../networking/packets/game-packets/player-chat-packet";

export default class PlayerConnectionManager {
    // This code is still not perfect, but it's much
    // better than it was before

    player: Player
    client: SocketPortalClient
    end = new ReceivingEnd()

    private worldEventHandler = new BasicEventHandlerSet()
    private primaryPlayerTransmitter = new PrimaryPlayerTransmitter()
    private visibleEntities = new Set<Entity>()
    private world: ServerGameWorld
    private tank: EntityModel

    constructor(player: Player, client: SocketPortalClient) {
        this.player = player
        this.client = client

        this.worldEventHandler.on("tick", () => this.onTick())
        this.worldEventHandler.on("entity-teleport", (entity) => this.updateEntityVisibility(entity))

        player.on("world-set", () => this.setWorld(player.world))
        player.on("tank-set", () => this.setTank(player.tank))

        client.on(PlayerControlsPacket, (packet) => {
            if(this.tank) packet.updateControls(this.tank.getComponent(TankControls))
        })

        client.on(PlayerRespawnPacket, (packet) => {
            if(this.world) this.world.emit("player-respawn", this.player)
        })

        client.on(PlayerChatPacket, (packet) => {
            if(this.world) this.world.emit("game-chat", this.player, packet.text)
        })

        client.on("disconnect", (client: SocketPortalClient) => {
            if(this.tank) {
                this.tank.die()
                this.tank = null
            }
            this.setWorld(null)
        })
    }

    private updateClient() {
        if (!this.end.hasData()) return;
        new WorldCommunicationPacket(this.end.spitBuffer()).sendTo(this.client.connection)
    }

    private onTick() {
        this.updateEntitiesVisibility()
        this.updateClient()
    }

    private setWorld(world: ServerGameWorld) {
        // Detach all transmitters from old world, because otherwise they will
        // be mixed with new world transmitters. It might also lead to issues
        // when new world is null, when player leaves the game. Transmitters
        // will keep send events to the disconnected player and server will crash.

        for(let transmitterSet of this.end.transmitterSets.values()) {
            transmitterSet.detachTransmitters()
        }

        this.world = world
        this.end.setRoot(world)
        this.worldEventHandler.setTarget(world)

        if(this.world) {
            let transmitComponent = this.world.getComponent(EntityDataTransmitComponent)
            let transmitterSet = transmitComponent.transmitterSetFor(this.end)
            transmitterSet.attachTransmitter(this.primaryPlayerTransmitter)
        }
    }

    private setTank(tank: EntityModel) {
        this.tank = tank
        this.makeEntityVisible(this.tank)
    }

    private updateEntitiesVisibility() {
        if(!this.tank) return
        let playerPosition = this.tank.getComponent(PhysicalComponent).getBody().GetPosition()
        let entityPosition = new b2Vec2();

        for(let entity of this.tank.parent.children) {
            let transform = entity.getComponent(TransformComponent)
            if(!transform) continue

            let offset = entityPosition.Copy(transform.getPosition()).SelfSub(playerPosition)
            let visible = offset.LengthSquared() < 40 ** 2

            this.setEntityVisibile(entity, visible)
        }
    }

    private updateEntityVisibility(entity: Entity) {
        let playerPosition = this.tank.getComponent(PhysicalComponent).getBody().GetPosition()
        let entityPosition = new b2Vec2();

        let transform = entity.getComponent(TransformComponent)
        if(!transform) return

        let offset = entityPosition.Copy(transform.getPosition()).SelfSub(playerPosition)
        let visible = offset.LengthSquared() < 40 ** 2

        this.setEntityVisibile(entity, visible)
    }

    private makeEntityVisible(entity: Entity) {
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return

        transmitComponent.transmitterSetFor(this.end)
        if(entity == this.tank) this.primaryPlayerTransmitter.setEntity(this.tank)
    }

    private makeEntityInvisible(entity: Entity) {
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return

        if(entity == this.tank) this.primaryPlayerTransmitter.setEntity(null)

        if(!transmitComponent.hasTransmitterSetForEnd(this.end)) return
        transmitComponent.transmitterSetFor(this.end).detachTransmitters()
    }

    private setEntityVisibile(entity: Entity, visible: boolean) {
        if(visible == this.visibleEntities.has(entity)) return

        if(visible) {
            this.visibleEntities.add(entity)
            this.makeEntityVisible(entity)
        } else {
            this.visibleEntities.delete(entity)
            this.makeEntityInvisible(entity)
        }
    }

    static attach(player: Player, client: SocketPortalClient) {
        return new PlayerConnectionManager(player, client)
    }
}