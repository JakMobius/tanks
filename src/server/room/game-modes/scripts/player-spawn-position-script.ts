import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import TilemapComponent from "src/physics/tilemap-component";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import Entity from "src/utils/ecs/entity";
import {chooseRandomIndex} from "src/utils/utils";

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
        const map = world.getComponent(TilemapComponent).map

        if(this.config.usePlayerTeam) {
            const team = player.getComponent(PlayerTeamComponent).team
            if(team) return map.spawnPointForTeam(team.id)
        }
        if(this.config.randomSpawnMode === RandomSpawnMode.randomOnMap) {
            return map.spawnPointForTeam(-1)
        } else {
            let index = chooseRandomIndex(map.spawnZones)
            return map.spawnPointForTeam(index)
        }
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        event.respawnPosition = this.getSpawnPosition(event.player)
    }
}