import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import Entity from "src/utils/ecs/entity";
import { chooseRandom } from "src/utils/utils";
import { SpawnZone } from "src/map/spawnzones-component";

export interface PlayerSpawnPositionScriptOptions {
    usePlayerTeam: boolean
    spawnZones: { team: number, zone: SpawnZone }[]
}

export class TeamedRespawnScript extends ServerGameScript {
    private config: PlayerSpawnPositionScriptOptions;

    constructor(controller: ServerGameController, config: PlayerSpawnPositionScriptOptions) {
        super(controller)
        this.config = config

        this.worldEventHandler.on("player-respawn", (player, event) => this.onPlayerRespawn(event))
    }

    spawnPointForTeam(id: number) {
        
        const zones = this.config.spawnZones.filter(zone => zone.team === id);
        const zone = chooseRandom(zones)?.zone

        return zone?.sample() ?? { x: 0, y: 0 }
    }

    private getSpawnPosition(player: Entity) {
        if(this.config.usePlayerTeam) {
            const team = player.getComponent(PlayerTeamComponent).team
            if(team) return this.spawnPointForTeam(team.id)
        }
        
        return chooseRandom(this.config.spawnZones)?.zone.sample() ?? { x: 0, y: 0 }
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        event.respawnPosition = this.getSpawnPosition(event.player)
    }
}

export class RandomRespawnScript extends ServerGameScript {
    private spawnZones: SpawnZone[];

    constructor(controller: ServerGameController, spawnZones: SpawnZone[]) {
        super(controller)
        this.spawnZones = spawnZones

        this.worldEventHandler.on("player-respawn", (player, event) => this.onPlayerRespawn(event))
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        event.respawnPosition = chooseRandom(this.spawnZones)?.sample() ?? { x: 0, y: 0 }
    }
}