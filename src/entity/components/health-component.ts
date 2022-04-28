import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import {TransmitterSet} from "./network/transmitting/transmitter-set";
import HealthTransmitter from "./network/health/health-transmitter";

export default class HealthComponent implements Component {
    private health: number = 0
    private maxHealth: number = 0
    entity: Entity | null;
    private entityHandler = new BasicEventHandlerSet()

    constructor() {
        this.entityHandler.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(HealthTransmitter)
        })

        this.entityHandler.on("respawn", () => {
            this.setHealth(this.maxHealth)
        })
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.setHealth(this.maxHealth)
        this.entityHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.entityHandler.setTarget(this.entity)
    }

    setMaxHealth(health: number) {
        this.maxHealth = health
    }

    setHealth(health: number) {
        this.health = health
        this.entity.emit("health-set", this.health)
    }

    getHealth() {
        return this.health
    }

    damage(damage: number) {
        this.setHealth(Math.max(0, this.health - damage))
    }
}