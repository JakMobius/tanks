import DMController, { DMGameStateController } from "src/entity/types/controller-dm/server-side/dm-controller";
import {DMMatchOverStateController} from "src/entity/types/controller-dm/server-side/dm-match-over-state-controller";
import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import WorldPlayerStatisticsComponent from "src/server/entity/components/world-player-statistics-component";
import {DMPlayerWaitingStateController} from "src/entity/types/controller-dm/server-side/dm-player-waiting-state";
import DamageRecorderComponent from "src/server/entity/components/damage-recorder-component";
import {DMGameState, DMGameStateType} from "src/entity/types/controller-dm/dm-game-state";
import QuickMatchEndScript from "src/server/room/game-modes/scripts/quick-match-end-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import MatchTimerExpireScript from "src/server/room/game-modes/scripts/match-timer-expire-script";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import Entity from "src/utils/ecs/entity";
import PlayerRespawnActionComponent from "src/entity/types/player/server-side/player-respawn-action-component";
import { RandomRespawnScript } from "src/server/room/game-modes/scripts/player-spawn-position-script";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";

export class DMPlayingStateController extends DMGameStateController {

    constructor(controller: DMController) {
        super(controller)

        this.worldEventHandler.on("player-death", (player) => this.onPlayerDeath(player))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount: number) => {
            if (playerCount == 0) this.abortMatch()
            this.getScript(QuickMatchEndScript).setQuickMatchEnd(playerCount == 1)
            this.controller.triggerStateBroadcast()
        }))

        this.addScript(new QuickMatchEndScript(this.controller, this.controller.singlePlayerMatchTime))

        this.addScript(new RandomRespawnScript(this.controller))

        this.addScript(new MatchTimerExpireScript(this.controller, () => {
            this.endMatch()
        }))
    }

    activate() {
        super.activate()
        const timeComponent = this.controller.entity.getComponent(GameTimeComponent)
        this.controller.world.getComponent(WorldStatisticsComponent)
            .getMatchLeftTimerComponent().countdownFrom(timeComponent.matchTime)
        this.controller.world.getComponent(WorldPlayerStatisticsComponent).resetAllStatistics()
        // TODO: reload map
        this.controller.triggerStateBroadcast()
        this.respawnPlayers()
    }

    private onPlayerDeath(player: Entity) {
        let damageRecorder = this.controller.world.getComponent(DamageRecorderComponent)

        let killer = damageRecorder.getDamageData(player).damagers[0]
        if(killer && killer !== player) {
            let statistics = this.controller.world.getComponent(WorldPlayerStatisticsComponent)
            statistics.scorePlayer(killer, 10)
        }
    }

    private abortMatch() {
        this.controller.activateGameState(new DMPlayerWaitingStateController(this.controller))
    }

    private endMatch() {
        this.controller.activateGameState(new DMMatchOverStateController(this.controller))
    }

    private respawnPlayers() {
        let players = this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players
        for(let player of players) {
            player.getComponent(PlayerRespawnActionComponent).performRespawnAction()
        }
    }

    getState(): DMGameState {
        return {
            state: DMGameStateType.playing,
            quickMatchEnd: this.getScript(QuickMatchEndScript).quickMatchEnd
        }
    }
}