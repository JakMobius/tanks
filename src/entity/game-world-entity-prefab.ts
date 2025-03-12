import Entity from "src/utils/ecs/entity";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import ChildTickComponent from "src/entity/components/child-tick-component";
import {Component} from "src/utils/ecs/component";
import { createTransmitterComponentFor } from "./components/network/transmitting/transmitter-component";
import WorldStatisticsTransmitter from "./components/world-statistics/world-statistics-transmitter";

export class WorldComponent implements Component {
    entity: Entity | null = null

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    static getWorld(entity: Entity) {
        while (entity && !entity.getComponent(WorldComponent)) {
            entity = entity.parent
        }
        return entity
    }
}

export function gameWorldEntityPrefab(entity: Entity) {
    entity.addComponent(new WorldComponent())
    entity.addComponent(new EntityStateTransmitComponent())
    entity.addComponent(new PhysicalHostComponent())
    entity.addComponent(new WorldStatisticsComponent())
    entity.addComponent(createTransmitterComponentFor(WorldStatisticsTransmitter))

    // World entities should tick at the very specific time
    // They should do so after physics tick, but before
    // the world communication. This is why world ticks are
    // emitted, not propagated.
    entity.addComponent(new ChildTickComponent())
}