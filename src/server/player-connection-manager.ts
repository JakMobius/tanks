import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import Entity from "../utils/ecs/entity";
import EntityDataTransmitComponent from "../entity/components/network/transmitting/entity-data-transmit-component";
import TransformComponent from "../entity/components/transform-component";
import PhysicalComponent from "../entity/components/physics-component";
import SocketPortalClient from "./socket/socket-portal-client";
import {ReceivingEnd} from "../entity/components/network/transmitting/receiving-end";
import PrimaryPlayerTransmitter from "../entity/components/network/primary-player/primary-player-transmitter";
import {b2Vec2} from "../library/box2d/common/b2_math";
import Player from "./player";
import WorldCommunicationPacket from "../networking/packets/game-packets/world-communication-packet";
import PlayerControlsPacket from "../networking/packets/game-packets/player-controls-packet";
import TankControls from "../controls/tank-controls";
import PlayerRespawnPacket from "../networking/packets/game-packets/player-respawn-packet";
import PlayerChatPacket from "../networking/packets/game-packets/player-chat-packet";
import PlayerChatEvent from "../events/player-chat-event";
import * as Box2D from "src/library/box2d"

export default class PlayerConnectionManager {
    player: Player
    client: SocketPortalClient
    end = new ReceivingEnd()

    private worldEventHandler = new BasicEventHandlerSet()
    private primaryPlayerTransmitter = new PrimaryPlayerTransmitter()
    private visibleEntities = new Set<Entity>()
    private world: Entity
    private tank: Entity
    private visibilityDistanceThreshold = 40

    constructor(player: Player, client: SocketPortalClient) {
        this.player = player
        this.client = client

        this.worldEventHandler.on("tick", () => this.onTick())

        player.on("world-set", () => this.setWorld(player.world))
        player.on("tank-set", () => this.setTank(player.tank))

        client.on(PlayerControlsPacket, (packet) => {
            if(this.tank) packet.updateControls(this.tank.getComponent(TankControls))
        })

        client.on(PlayerRespawnPacket, (packet) => {
            if(this.player) this.player.respawn()
        })

        client.on(PlayerChatPacket, (packet) => {
            if(this.world) this.world.emit("player-chat", new PlayerChatEvent(this.player, packet.text))
        })

        client.on("disconnect", (client: SocketPortalClient) => {
            if(this.tank) this.tank.removeFromParent()
            this.player.connectToWorld(null)
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

    private setWorld(world: Entity) {
        // Detach all transmitters from old world, because otherwise they will
        // be mixed with new world transmitters. It might also lead to issues
        // when new world is null, when player leaves the game. Transmitters
        // will keep send events to the disconnected player and server will crash.

        this.end.detachSubtree()

        this.world = world
        this.end.setRoot(world)
        this.worldEventHandler.setTarget(world)

        if(this.world) {
            let transmitComponent = this.world.getComponent(EntityDataTransmitComponent)
            let transmitterSet = transmitComponent.createTransmitterSetFor(this.end)
            transmitterSet.attachTransmitter(this.primaryPlayerTransmitter)
        }
    }

    private setTank(tank: Entity) {
        this.tank = tank
    }

    private shouldEntityBeVisible(entity: Entity, position?: b2Vec2) {
        if(entity == this.tank) {
            return true
        }

        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return false

        if(transmitComponent.visibleAnywhere) {
            return true
        } else {
            return this.isEntityNear(entity, position)
        }
    }

    private isEntityNear(entity: Entity, position?: b2Vec2) {
        if(!position) return false
        let transform = entity.getComponent(TransformComponent)
        if (!transform) return false

        let entityPosition = transform.getPosition()
        entityPosition.x -= position.x
        entityPosition.y -= position.y

        return entityPosition.x * entityPosition.x + entityPosition.y * entityPosition.y < this.visibilityDistanceThreshold ** 2
    }

    private updateEntitiesVisibility() {
        let playerPosition: Box2D.Vec2 | null = null
        if(this.tank) {
            playerPosition = this.tank.getComponent(PhysicalComponent).getBody().GetPosition()
        }

        for(let entity of this.end.root.children) {
            this.setEntityVisible(entity, this.shouldEntityBeVisible(entity, playerPosition))
        }
    }

    private makeEntityVisible(entity: Entity) {
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return

        transmitComponent.createTransmitterSetFor(this.end)
        if(entity == this.tank) this.primaryPlayerTransmitter.setEntity(this.tank)
    }

    private makeEntityInvisible(entity: Entity) {
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return

        if(entity == this.tank) this.primaryPlayerTransmitter.setEntity(null)

        if(!transmitComponent.hasTransmitterSetForEnd(this.end)) return
        transmitComponent.transmitterSetFor(this.end).detachTransmitters()
    }

    private setEntityVisible(entity: Entity, visible: boolean) {
        if(visible == this.visibleEntities.has(entity)) return false

        if(visible) {
            this.visibleEntities.add(entity)
            this.makeEntityVisible(entity)
        } else {
            this.visibleEntities.delete(entity)
            this.makeEntityInvisible(entity)
        }

        return true
    }

    static attach(player: Player, client: SocketPortalClient) {
        return new PlayerConnectionManager(player, client)
    }
}