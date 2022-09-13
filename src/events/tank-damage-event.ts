import CancellableEvent from "./cancellable-event";
import DamageReason from "../server/damage-reason/damage-reason";
import Entity from "../utils/ecs/entity";

export default class EntityDamageEvent extends CancellableEvent {
    entity: Entity
    damage: number
    damageReason: DamageReason

    constructor(entity: Entity, damage: number, damageReason: DamageReason) {
        super();
        this.entity = entity
        this.damage = damage
        this.damageReason = damageReason
    }
}