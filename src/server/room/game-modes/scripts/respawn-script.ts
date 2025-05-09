import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script";
import ServerGameController from "src/server/room/game-modes/server-game-controller";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import Entity from "src/utils/ecs/entity";
import { chooseRandom } from "src/utils/utils";
import GameSpawnzonesComponent from "../game-spawnzones-component";
import SpawnzoneComponent from "src/entity/types/spawn-zone/spawnzone-component";

export interface PlayerSpawnPositionScriptOptions {
    usePlayerTeam: boolean
}

export class TeamedRespawnScript extends ServerGameScript {
    private config: PlayerSpawnPositionScriptOptions;

    constructor(controller: ServerGameController, config: PlayerSpawnPositionScriptOptions) {
        super(controller)
        this.config = config

        this.worldEventHandler.on("player-respawn", (player, event) => this.onPlayerRespawn(event))
    }

    spawnPointForTeam(id: number) {
        const spawnzonesComponent = this.controller.entity.getComponent(GameSpawnzonesComponent)
        
        let zones = []

        if(id === -1) {
            zones = spawnzonesComponent.spawnzones
        } else {
            zones = spawnzonesComponent.spawnzones.filter(entity => {
                return entity.getComponent(SpawnzoneComponent).team === id
            });
        }

        let randomZone = chooseRandom(zones)?.getComponent(SpawnzoneComponent)

        return {
            position: randomZone?.sample() ?? { x: 0, y: 0 },
            angle: randomZone?.getGlobalSpawnAngle() ?? 0
        }
    }

    private getSpawnPosition(player: Entity) {
        if(this.config.usePlayerTeam) {
            const team = player.getComponent(PlayerTeamComponent).team
            if(team) return this.spawnPointForTeam(team.id)
        }
        
        return this.spawnPointForTeam(-1)
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        let respawnPosition = this.getSpawnPosition(event.player)
        event.respawnPosition = respawnPosition.position
        event.respawnAngle = respawnPosition.angle
    }
}

export class RandomRespawnScript extends ServerGameScript {
    constructor(controller: ServerGameController) {
        super(controller)
        this.worldEventHandler.on("player-respawn", (player, event) => this.onPlayerRespawn(event))
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        let spawnzonesComponent = this.controller.entity.getComponent(GameSpawnzonesComponent).spawnzones
        let zone = chooseRandom(spawnzonesComponent)?.getComponent(SpawnzoneComponent)
        
        event.respawnPosition = zone?.sample() ?? { x: 0, y: 0 }
        event.respawnAngle = zone?.getGlobalSpawnAngle() ?? 0
    }
}