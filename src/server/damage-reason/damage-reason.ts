import {DamageTypes} from "src/entity/components/health-component";
import Player from "../player";

export default class DamageReason {

    damageType = DamageTypes.UNKNOWN
    players: Player[] | null = null

    constructor() {

    }
}