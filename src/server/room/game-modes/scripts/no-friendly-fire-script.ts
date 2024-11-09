import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import EntityDamageEvent from "src/events/tank-damage-event";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";

export default class NoFriendlyFireScript extends ServerGameScript {

    constructor(controller: ServerGameController) {
        super(controller)
        this.worldEventHandler.on("entity-damage", (event) => this.onEntityDamage(event))
    }

    private onEntityDamage(event: EntityDamageEvent) {
        const damagerPlayer = event.damageReason.player
        if(!damagerPlayer) return

        const damagerTeam = damagerPlayer.getComponent(PlayerTeamComponent).team
        if(!damagerTeam) return

        const victimEntity = event.entity

        const victimPilotComponent = victimEntity.getComponent(ServerEntityPilotComponent)
        if (!victimPilotComponent) return

        const victimPilot = victimPilotComponent.pilot
        if(!victimPilot) return

        const victimPilotTeam = victimPilotComponent.pilot.getComponent(PlayerTeamComponent).team
        if(!victimPilotTeam) return

        if (damagerTeam === victimPilotTeam) {
            event.cancel()
        }
    }
}