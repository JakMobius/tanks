import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import BlockDamageEvent from "src/events/block-damage-event";
import EntityDamageEvent from "src/events/tank-damage-event";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import {DamageTypes} from "src/entity/components/health-component";

export default class NoDamageScript extends ServerGameScript {

    allowSelfDestruction: boolean = true

    constructor(controller: ServerGameController) {
        super(controller)
        this.worldEventHandler.on("entity-damage", (event: EntityDamageEvent) => this.onEntityDamage(event))
        this.worldEventHandler.on("map-block-damage", (event: BlockDamageEvent) => event.cancel())
    }

    private onEntityDamage(event: EntityDamageEvent) {
        if(event.damageReason.damageType == DamageTypes.SELF_DESTRUCT && this.allowSelfDestruction) {
            return
        }
        event.cancel()
    }
}