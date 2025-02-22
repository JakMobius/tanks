import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import Entity from "src/utils/ecs/entity";
import {chooseRandomIndex} from "src/utils/utils";
import WorldTilemapComponent from "src/physics/world-tilemap-component";
import SpawnzonesComponent from "src/map/spawnzones-component";

export enum RandomSpawnMode {
    randomOnMap,
    randomTeamSpawn
}

export interface PlayerSpawnPositionScriptOptions {
    usePlayerTeam: boolean
    randomSpawnMode: RandomSpawnMode
}

export default class PlayerSpawnPositionScript extends ServerGameScript {
    private config: PlayerSpawnPositionScriptOptions;

    constructor(controller: ServerGameController, config: PlayerSpawnPositionScriptOptions) {
        super(controller)
        this.config = config

        this.worldEventHandler.on("player-respawn", (player, event) => this.onPlayerRespawn(event))
    }

    private getSpawnPosition(player: Entity) {
        const world = this.controller.world
        const map = world.getComponent(WorldTilemapComponent).map
        const spawnzones = map.getComponent(SpawnzonesComponent)


        if(this.config.usePlayerTeam) {
            const team = player.getComponent(PlayerTeamComponent).team
            if(team) return spawnzones.spawnPointForTeam(team.id)
        }
        if(this.config.randomSpawnMode === RandomSpawnMode.randomOnMap) {
            return spawnzones.spawnPointForTeam(-1)
        } else {
            let index = chooseRandomIndex(spawnzones.spawnZones)
            return spawnzones.spawnPointForTeam(index)
        }
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        event.respawnPosition = this.getSpawnPosition(event.player)
    }
}