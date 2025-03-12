import Entity from "src/utils/ecs/entity";
import DamageReason, { DamageType, DamageTypes } from "src/server/damage-reason/damage-reason";
import EntityDamageEvent from "src/events/tank-damage-event";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class HealthComponent extends EventHandlerComponent {
    private health: number = 0
    private maxHealth: number = 0

    damageModifiers = new Map<DamageType, ((damage: number) => number)[]>();

    constructor() {
        super()

        this.eventHandler.on("respawn", () => {
            this.setHealth(this.maxHealth)
        })
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)
        this.setHealth(this.maxHealth)
    }

    setToMaxHealth(health: number) {
        this.health = health
        this.maxHealth = health
        return this
    }

    setHealth(health: number) {
        let oldHealth = this.health
        this.health = health
        this.entity.emit("health-set", this.health, oldHealth)

        if(this.entity.parent) {
            this.entity.parent.emit("entity-health-set", this.entity, this.health, oldHealth)
        }

        if(this.health <= 0 && oldHealth > 0) {
            this.entity.emit("death")
            if(this.entity.parent) {
                this.entity.parent.emit("entity-death", this.entity)
            }
        }
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

    getMaxHealth() {
        return this.maxHealth
    }

    getModifiedDamage(damage: number, damageReason: DamageReason) {
        let damageType = DamageTypes.UNKNOWN
        if(damageReason) {
            damageType = damageReason.damageType
        }
        let modifiers = this.damageModifiers.get(damageType)
        if(!modifiers) return damage

        for(let modifier of modifiers) {
            damage = modifier(damage)
            if(damage < 0) return 0;
        }

        return damage
    }

    damage(damage: number, damageReason: DamageReason = null) {
        if(!damageReason) damageReason = new DamageReason()

        damage = this.getModifiedDamage(damage, damageReason)

        if (damage <= 0) {
            return;
        }

        let event = new EntityDamageEvent(this.entity, damage, damageReason)

        this.entity.emit("damage", event)
        if(this.entity.parent) {
            this.entity.parent.emit("entity-damage", event)
        }

        if(event.cancelled) return

        this.setHealth(Math.max(0, this.health - damage))
    }
}