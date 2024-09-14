import {DamageTypes} from "src/entity/components/health-component";
import Entity from "src/utils/ecs/entity";

export default class DamageReason {

    damageType = DamageTypes.UNKNOWN
    player: Entity | null = null

    constructor() {

    }
}