
import ServerGameScript from "src/server/room/game-modes/scripts/server-game-script"
import ServerGameController from "src/server/room/game-modes/server-game-controller"
import { PlayerRaceStateComponent } from "./player-race-state-component"
import { RaceCheckpointsComponent } from "./game-checkpoints-component"
import TransformComponent from "src/entity/components/transform/transform-component"
import PlayerRespawnEvent from "src/events/player-respawn-event"
import SpawnzoneComponent from "../../spawn-zone/spawnzone-component"
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component"
import { chooseRandom } from "src/utils/utils"

export class CheckpointRespawnScript extends ServerGameScript {
    constructor(controller: ServerGameController) {
        super(controller)
        this.worldEventHandler.on("player-respawn", (player, event) => this.onPlayerRespawn(event))
    }

    private onPlayerRespawn(event: PlayerRespawnEvent) {
        
        let stateComponent = event.player.getComponent(PlayerRaceStateComponent)
        let checkpointIndex = stateComponent?.lastCheckpointIndex

        if(checkpointIndex === null) {
            let spawnzonesComponent = this.controller.entity.getComponent(GameSpawnzonesComponent).spawnzones
            let spawnzone = chooseRandom(spawnzonesComponent)?.getComponent(SpawnzoneComponent)

            event.respawnPosition = spawnzone?.center() ?? { x: 0, y: 0 }
            event.respawnAngle = spawnzone?.getGlobalSpawnAngle() ?? 0
        } else {
            let checkpointsComponent = this.controller.entity.getComponent(RaceCheckpointsComponent).checkpoints
            let checkpoint = checkpointsComponent[checkpointIndex]

            let transform = checkpoint?.getComponent(TransformComponent)
            
            event.respawnPosition = transform?.getGlobalPosition() ?? { x: 0, y: 0 }
            event.respawnAngle = transform?.getGlobalAngle() ?? 0
        }
    }
}