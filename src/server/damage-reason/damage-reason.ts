import Entity from "src/utils/ecs/entity";

export type DamageType = number
export const DamageTypes = {
    UNKNOWN:       0,
    EXPLOSION:     1,
    IMPACT:        2,
    ELECTRICAL:    3,
    FIRE:          4,
    SELF_DESTRUCT: 5
}

export const DamageModifiers = {
    resistance(strength: number) {
        return (damage: number) => damage - strength
    },
    damageMultiplier(factor: number) {
        return (damage: number) => damage * factor
    }
}

export default class DamageReason {

    damageType = DamageTypes.UNKNOWN
    player: Entity | null = null

    constructor() {

    }
}