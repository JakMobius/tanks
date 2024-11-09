import Entity from "src/utils/ecs/entity";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class PlayerVisibilityManagerComponent extends EventHandlerComponent {
    entity: Entity | null;
    visibleEntities = new Set<Entity>()

    private makeEntityVisible(entity: Entity) {
        const connectionManager = this.entity.getComponent(PlayerConnectionManagerComponent)
        const transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return

        if(transmitComponent.hasTransmitterSetForEnd(connectionManager.end)) return
        transmitComponent.createTransmitterSetFor(connectionManager.end)
    }

    private makeEntityInvisible(entity: Entity) {
        const connectionManager = this.entity.getComponent(PlayerConnectionManagerComponent)
        const transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        if(!transmitComponent) return

        if(!transmitComponent.hasTransmitterSetForEnd(connectionManager.end)) return
        transmitComponent.removeTransmitterSetFor(connectionManager.end)
    }

    public setEntityVisible(entity: Entity, visible: boolean) {
        if(visible === this.visibleEntities.has(entity)) return false

        if(visible) {
            this.visibleEntities.add(entity)
            this.makeEntityVisible(entity)
        } else {
            this.visibleEntities.delete(entity)
            this.makeEntityInvisible(entity)
        }

        return true
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}