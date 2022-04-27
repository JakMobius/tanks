import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import {TransmitterSet} from "./network/transmitting/transmitter-set";
import HealthTransmitter from "./network/health/health-transmitter";

export default class HealthComponent implements Component {
    private health: number = 0
    entity: Entity | null;
    private entityHandler = new BasicEventHandlerSet()

    constructor() {
        this.entityHandler.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(HealthTransmitter)
        })
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.entityHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.entityHandler.setTarget(this.entity)
    }

    setHealth(health: number) {
        this.health = health
        this.entity.emit("health-set")
    }

    getHealth() {
        return this.health
    }

    damage(damage: number) {
        // this.setHealth(Math.max(0, this.health - damage))
    }
}