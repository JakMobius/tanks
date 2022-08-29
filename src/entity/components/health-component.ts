import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import {TransmitterSet} from "./network/transmitting/transmitter-set";
import HealthTransmitter from "./network/health/health-transmitter";

export type DamageType = number
export const DamageTypes = {
    UNKNOWN:    0,
    EXPLOSION:  1,
    IMPACT:     2,
    ELECTRICAL: 3,
    FIRE:       4
}

export const DamageModifiers = {
    resistance(strength: number) {
        return (damage: number) => damage - strength
    },
    damageMultiplier(factor: number) {
        return (damage: number) => damage * factor
    }
}

export default class HealthComponent implements Component {
    private health: number = 0
    private maxHealth: number = 0
    entity: Entity | null;

    damageModifiers = new Map<DamageType, ((damage: number) => number)[]>();

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

    // TODO: For now, max health is only set on server side, which can lead to weird smoke effects on first spawn.
    setMaxHealth(health: number) {
        this.maxHealth = health
        return this
    }

    setHealth(health: number) {
        this.health = health
        this.entity.emit("health-set", this.health)
        return this
    }

    addDamageModifier(modifier: (damage: number) => number, damageType: DamageType) {
        let array = this.damageModifiers.get(damageType)
        if(!array) {
            this.damageModifiers.set(damageType, [modifier])
        } else {
            array.push(modifier)
        }
    }

    getHealth() {
        return this.health
    }

    getModifiedDamage(damage: number, damageType: DamageType = DamageTypes.UNKNOWN) {
        let modifiers = this.damageModifiers.get(damageType)
        if(!modifiers) return damage

        for(let modifier of modifiers) {
            damage = modifier(damage)
            if(damage < 0) return 0;
        }

        return damage
    }

    damage(damage: number, damageType: DamageType = DamageTypes.UNKNOWN) {
        damage = this.getModifiedDamage(damage, damageType)

        if(damage > 0) {
            this.setHealth(Math.max(0, this.health - damage))
        }
    }
}