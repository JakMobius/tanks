import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import TransformComponent from "src/entity/components/transform-component";
import * as Box2D from "@box2d/core";
import PhysicalComponent from "src/entity/components/physics-component";
import PlayerVisibilityManagerComponent from "src/entity/types/player/server-side/player-visibility-manager-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";

export default class PlayerVisibilityDecisionComponent extends EventHandlerComponent {

    private visibilityDistanceThreshold = 60
    private worldEventHandler = new BasicEventHandlerSet()
    private oldWorld: Entity = null

    childAddHandler = (child: Entity) => this.onChildAdded(child)
    childRemoveHandler = (child: Entity) => this.onChildRemoved(child)

    constructor() {
        super();
        this.eventHandler.on("world-set", () => this.updateWorld())
        this.worldEventHandler.on("tick", () => this.updateEntitiesVisibility())
    }

    onChildAdded(child: Entity) {
        const visibilityManager = this.entity.getComponent(PlayerVisibilityManagerComponent)
        visibilityManager.setEntityVisible(child, true)
        child.on("child-added", this.childAddHandler)
        child.on("did-remove-child", this.childRemoveHandler)

        for (let nestedChild of child.children) {
            this.onChildAdded(nestedChild)
        }
    }

    onChildRemoved(child: Entity) {
        const visibilityManager = this.entity.getComponent(PlayerVisibilityManagerComponent)
        visibilityManager.setEntityVisible(child, false)
        child.off("child-added", this.childAddHandler)
        child.off("did-remove-child", this.childRemoveHandler)

        for (let nestedChild of child.children) {
            this.onChildRemoved(nestedChild)
        }
    }

    private shouldEntityBeVisible(entity: Entity, position?: Box2D.b2Readonly<Box2D.XY>) {
        if(entity == this.getPlayerTank()) {
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

    private isEntityNear(entity: Entity, position?: Box2D.b2Readonly<Box2D.XY>) {
        if(!position) return false
        let transform = entity.getComponent(TransformComponent)
        if (!transform) return false

        let entityPosition = transform.getPosition()
        entityPosition.x -= position.x
        entityPosition.y -= position.y

        return entityPosition.x * entityPosition.x + entityPosition.y * entityPosition.y < this.visibilityDistanceThreshold ** 2
    }

    private updateEntitiesVisibility() {
        // Everything is visible now. TODO
        return
        let playerPosition: Box2D.b2Readonly<Box2D.b2Vec2> | null = null
        const tank = this.getPlayerTank()
        const world = this.getWorld()

        if(tank) {
            playerPosition = tank.getComponent(PhysicalComponent).getBody().GetPosition()
        }

        const visibilityManager = this.entity.getComponent(PlayerVisibilityManagerComponent)

        for(let entity of world.children) {
            visibilityManager.setEntityVisible(entity, this.shouldEntityBeVisible(entity, playerPosition))
        }
    }

    private getWorld() {
        return this.entity.getComponent(PlayerWorldComponent).world
    }

    private getPlayerTank() {
        return this.entity.getComponent(PlayerTankComponent).tank
    }

    private updateWorld() {
        if(this.oldWorld) {
            this.onChildRemoved(this.oldWorld)
        }
        let world = this.getWorld()
        this.oldWorld = world
        if(world) {
            this.onChildAdded(world)
        }
        this.worldEventHandler.setTarget(world)
        if(world) this.updateEntitiesVisibility()
    }
}